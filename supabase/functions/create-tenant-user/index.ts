import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  console.log('=== Create Tenant User Function Called ===')
  console.log('Method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey 
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await req.json()
    console.log('Request body received:', { 
      hasEmail: !!body.email, 
      hasPassword: !!body.password, 
      role: body.role, 
      hasTenantId: !!body.tenant_id 
    })
    
    const { email, password, full_name, role, tenant_id } = body

    // Validate inputs
    if (!email || !password || !role || !tenant_id) {
      console.error('Validation failed - missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, role, tenant_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      console.error('Password too short')
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valid roles
    const validRoles = ['tenant_admin', 'chef', 'manager', 'waiter']
    if (!validRoles.includes(role)) {
      console.error('Invalid role:', role)
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email)
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      throw new Error('Failed to check existing users')
    }
    
    const existingUser = existingUsers?.users.find(u => u.email === email)
    console.log('Existing user found:', !!existingUser)
    
    let userId: string
    
    if (existingUser) {
      // User already exists in auth, use existing user
      console.log('Using existing user:', existingUser.id)
      userId = existingUser.id
      
      // Check if profile exists, if not create it
      console.log('Checking for existing profile')
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      
      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError)
      }
      
      console.log('Profile exists:', !!existingProfile)
      
      if (!existingProfile) {
        console.log('Creating profile for existing user')
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            full_name: full_name || email.split('@')[0],
            email: email,
            tenant_id: tenant_id
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
          throw profileError
        }
        console.log('Profile created successfully')
      }
    } else {
      // Create new user
      console.log('Creating new user')
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || email.split('@')[0]
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        throw authError
      }
      if (!authData.user) {
        console.error('No user data returned from auth')
        throw new Error('Failed to create user')
      }
      
      console.log('Auth user created:', authData.user.id)
      userId = authData.user.id

      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if profile was created by trigger, if so update it, otherwise create it
      console.log('Checking if profile was created by trigger')
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      
      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError)
      }
      
      console.log('Profile exists:', !!existingProfile)
      
      if (existingProfile) {
        // Profile was created by trigger, update it with tenant_id
        console.log('Updating profile created by trigger')
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            tenant_id: tenant_id,
            full_name: full_name || email.split('@')[0]
          })
          .eq('id', userId)
        
        if (profileError) {
          console.error('Error updating profile:', profileError)
          console.log('Cleaning up auth user due to profile error')
          await supabaseAdmin.auth.admin.deleteUser(userId)
          throw profileError
        }
        console.log('Profile updated successfully')
      } else {
        // No profile exists, create it
        console.log('Creating profile for new user')
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            full_name: full_name || email.split('@')[0],
            email: email,
            tenant_id: tenant_id
          })

        if (profileError) {
          console.error('Error creating profile for new user:', profileError)
          console.log('Cleaning up auth user due to profile error')
          await supabaseAdmin.auth.admin.deleteUser(userId)
          throw profileError
        }
        console.log('Profile created successfully')
      }
    }

    // Check if role already exists for this tenant
    console.log('Checking for existing role')
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('tenant_id', tenant_id)
      .maybeSingle()
    
    if (roleCheckError) {
      console.error('Error checking existing role:', roleCheckError)
    }
    
    console.log('Existing role found:', !!existingRole)
    
    if (existingRole) {
      console.error('User already has role in tenant')
      return new Response(
        JSON.stringify({ error: 'User already has a role in this tenant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert role into user_roles table
    console.log('Inserting role:', role)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        tenant_id: tenant_id,
        email: email,
        name: full_name || email.split('@')[0]
      })

    if (roleError) {
      console.error('Error inserting role:', roleError)
      throw roleError
    }
    
    console.log('Role inserted successfully')
    console.log('=== User creation completed successfully ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userId,
        email: email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== Error creating tenant user ===')
    console.error('Error details:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the user'
    console.error('Error message:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
