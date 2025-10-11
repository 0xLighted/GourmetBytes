import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export class AuthService {
  private supabase = createClientComponentClient()
  private router = useRouter()

  async emailLogin(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    this.router.push('/')
  }

  async emailSignUp(email: string, password: string, name: string, geminiKey: string) {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          gemini_key: geminiKey,
        }
      }
    })
    if (error) throw error
    this.router.push('/confirm-email')
  }

  async oAuthLogin(provider: 'google' | 'github') {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  async updateUser(updateInfo: object) {
    console.log(updateInfo)
    const { error: updateError } = await this.supabase.auth.updateUser(updateInfo)
    if (updateError) throw updateError
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })
    if (error) throw error
    return true
  }
} 