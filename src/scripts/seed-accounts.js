import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isqtahbckrtkexjucxze.supabase.co';
const supabaseKey = 'sb_publishable_dxp7JfpwuStyQOIPD7CQ2g_FOTaNpZ-'; // Anon Key

async function createAndPromote(email, password, fullName, role) {
    console.log(`Creating user: ${email}...`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Sign Up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    });

    if (signUpError) {
        console.error(`Error signing up ${email}:`, signUpError.message);
        return;
    }

    console.log(`User ${email} created. Attempting to promote to ${role}...`);

    // 2. Sign In to get session (needed for RLS update)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error(`Error signing in ${email}:`, signInError.message);
        return;
    }

    const userId = signInData.user.id;

    // 3. Update Profile Role (Using the fact that RLS allows users to update their own profile)
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', userId);

    if (updateError) {
        console.error(`Error promoting ${email}:`, updateError.message);
    } else {
        console.log(`Successfully created and promoted ${email} to ${role}!`);
    }

    // Sign out
    await supabase.auth.signOut();
}

async function main() {
    // Create Super Admin
    await createAndPromote('admin@gmail.com', 'password', 'Master Admin', 'super_admin');
    
    // Create Admin Dinas
    await createAndPromote('dinas@gmail.com', 'password', 'Petugas Dinas', 'admin_dinas');
    
    // Create Pemilik UMKM
    await createAndPromote('umkm@gmail.com', 'password', 'Budi Pemilik', 'pemilik_umkm');
}

main();
