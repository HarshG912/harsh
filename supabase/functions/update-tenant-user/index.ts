import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  console.log('=== Update Tenant User Function Called ===')
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
      hasUserId: !!body.user_id,
      hasEmail: !!body.email, 
      hasPassword: !!body.password, 
      role: body.role, 
      hasTenantId: !!body.tenant_id 
    })
    
    const { user_id, email, password, full_name, role, tenant_id } = body

    // Validate inputs
    if (!user_id || !tenant_id) {
      console.error('Validation failed - missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, tenant_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password && password.length < 6) {
      console.error('Password too short')
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Valid roles
    const validRoles = ['tenant_admin', 'chef', 'manager', 'waiter']
    if (role && !validRoles.includes(role)) {
      console.error('Invalid role:', role)
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update auth user if email or password is provided
    if (email || password) {
      console.log('Updating auth user')
      const updateData: any = {}
      if (email) updateData.email = email
      if (password) updateData.password = password
      
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        updateData
      )

      if (authError) {
        console.error('Error updating auth user:', authError)
        throw authError
      }
      console.log('Auth user updated successfully')
    }

    // Update profile
    if (full_name || email) {
      console.log('Updating profile')
      const profileUpdate: any = {}
      if (full_name) profileUpdate.full_name = full_name
      if (email) profileUpdate.email = email
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user_id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        throw profileError
      }
      console.log('Profile updated successfully')
    }

    // Update user_roles
    console.log('Updating user role')
    const roleUpdate: any = {}
    if (role) roleUpdate.role = role
    if (email) roleUpdate.email = email
    if (full_name) roleUpdate.name = full_name
    
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .update(roleUpdate)
      .eq('user_id', user_id)
      .eq('tenant_id', tenant_id)

    if (roleError) {
      console.error('Error updating role:', roleError)
      throw roleError
    }
    
    console.log('Role updated successfully')
    console.log('=== User update completed successfully ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user_id,
        email: email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== Error updating tenant user ===')
    console.error('Error details:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the user'
    console.error('Error message:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})