import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat, Lightbulb, Sparkles, Heart, Clock, Users, Utensils, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-gradient-from">
      {/* Hero Section */}
      <section className="relative bg-gray-200 dark:bg-gradient-to-br dark:from-dark-gradient-from dark:to-dark-gradient-to py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-6 leading-tight">
                Cook Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Chef</span> with Ingredients You Already Have
              </h1>
              <p className="text-black/60 dark:text-white/60 text-lg md:text-xl mb-8 max-w-2xl mx-auto md:mx-0">
                Gourmet Bytes uses AI to create personalized recipes based on the ingredients in your kitchen, dietary preferences, and cooking skill level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/generate"
                  className="bg-gradient-to-r from-orange-500 to-red-700 hover:from-orange-400 hover:to-red-600 text-white font-medium py-3 px-8 rounded-md transition-all duration-300 shadow-lg hover:shadow-orange-900/20 text-center flex items-center justify-center"
                >
                  Create a Recipe <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#instructions"
                  className="bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-black dark:text-white font-medium py-3 px-8 rounded-md transition-all duration-300 text-center"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-orange-900/20 w-full aspect-[4/3]">
                <Image
                  src="/images/hero-food.jpg"
                  alt="Delicious gourmet meal created with Gourmet Bytes"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/25 dark:bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 rounded-full p-2">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Ready in 25 minutes</p>
                      <p className="text-white/50 text-sm">Using ingredients you already have</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -left-8 bg-gray-50 dark:bg-dark-gradient-to p-3 rounded-lg shadow-xl transform -rotate-6">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-orange-500" />
                  <span className="text-black dark:text-white font-bold">Gourmet level</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-gray-50 dark:bg-dark-gradient-to p-3 rounded-lg shadow-xl transform rotate-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  <span className="text-black dark:text-white font-bold">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-gradient-radial from-orange-500/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-gradient-radial from-red-700/30 to-transparent rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-100 dark:bg-dark-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6">Why Choose Gourmet Bytes</h2>
            <p className="text-black/60 dark:text-white/60 text-lg max-w-3xl mx-auto">
              Our AI-powered cookbook helps you create amazing meals with minimal effort,
              learn new cooking techniques, and share your culinary experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-orange-900/20 group-hover:shadow-orange-500/40 transition-all duration-300">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">AI-Powered Recipes</h3>
              <p className="text-black/60 dark:text-white/60">
                Generate personalized recipes based on ingredients you have at home. No more wasting food or last-minute grocery runs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-purple-900/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                <Utensils className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Personalized Preferences</h3>
              <p className="text-black/60 dark:text-white/60">
                Set dietary restrictions, cuisine preferences, and skill level to get perfectly tailored recipes every time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-green-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-green-900/20 group-hover:shadow-green-500/40 transition-all duration-300">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Save Favorites</h3>
              <p className="text-black/60 dark:text-white/60">
                Build your personal collection of favorite recipes that you can access anytime, anywhere.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-yellow-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-yellow-900/20 group-hover:shadow-yellow-500/40 transition-all duration-300">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Quick & Easy</h3>
              <p className="text-black/60 dark:text-white/60">
                Get step-by-step instructions with preparation times. Perfect for busy professionals and beginners alike.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Open Marketplace</h3>
              <p className="text-black/60 dark:text-white/60">
                Share your recipes, browse creations from others, and build a community of food enthusiasts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-red-500/30 transition-all duration-300 group shadow-sm">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-red-900/20 group-hover:shadow-red-500/40 transition-all duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Cooking Tips & Tricks</h3>
              <p className="text-black/60 dark:text-white/60">
                Learn professional cooking techniques and insider tips to elevate your culinary skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="instructions" className="py-20 bg-gray-50 dark:bg-dark-gradient-from relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6">How Gourmet Bytes Works</h2>
            <p className="text-black/60 dark:text-white/60 text-lg max-w-3xl mx-auto">
              Creating gourmet meals with what you have has never been this simple.
              Just follow these steps and start cooking like a professional chef.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30 hidden md:block"></div>
            
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full shadow-sm">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/20 z-20">1</div>
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4 text-center">Tell Us What You Have</h3>
                  <p className="text-black/60 dark:text-white/60 text-center">
                    Input the ingredients you have in your kitchen and any dietary restrictions or preferences.
                  </p>
                  <div className="mt-6 bg-white dark:bg-dark-gradient-from rounded-lg p-4 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-black dark:text-white text-sm">Ingredients List</span>
                      <span className="text-xs text-green-400">8 items</span>
                    </div>
                    <div className="space-y-2">
                      {["Chicken breast", "Olive oil", "Garlic", "Onions", "Pasta"].map((item, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-white/10 py-1.5 px-3 rounded-md text-sm text-black dark:text-white">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full shadow-sm">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/20 z-20">2</div>
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4 text-center">Get AI-Generated Recipes</h3>
                  <p className="text-black/60 dark:text-white/60 text-center">
                    Our AI suggests personalized recipes optimized for your ingredients and preferences.
                  </p>
                  <div className="mt-6 bg-white dark:bg-dark-gradient-from rounded-lg p-4 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      <span className="text-black dark:text-white text-sm">AI suggesting recipes...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 py-2 px-3 rounded-md text-sm text-black dark:text-white border border-orange-500/20">
                        Garlic Chicken Pasta with Caramelized Onions
                      </div>
                      <div className="bg-gray-100 dark:bg-white/10 py-2 px-3 rounded-md text-sm text-black dark:text-white">
                        One-Pan Mediterranean Chicken
                      </div>
                      <div className="bg-gray-100 dark:bg-white/10 py-2 px-3 rounded-md text-sm text-black dark:text-white">
                        Quick Creamy Garlic Chicken Pasta
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white dark:bg-gradient-to-br dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full shadow-sm">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/20 z-20">3</div>
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-4 text-center">Cook & Share</h3>
                  <p className="text-black/60 dark:text-white/60 text-center">
                    Follow the detailed instructions, cook your meal, and share your results with the community.
                  </p>
                  <div className="mt-6 bg-white dark:bg-dark-gradient-from rounded-lg p-4 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="text-black dark:text-white text-sm">Community favorites</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square rounded-md bg-gray-100 dark:bg-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white">Chicken Pasta</div>
                      </div>
                      <div className="aspect-square rounded-md bg-gray-100 dark:bg-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white">Garlic Chicken</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              href="/generate"
              className="bg-gradient-to-r from-orange-500 to-red-700 hover:from-orange-400 hover:to-red-600 text-white font-medium py-3 px-8 rounded-md transition-all duration-300 shadow-lg hover:shadow-orange-900/20 inline-flex items-center"
            >
              Start Cooking Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -right-1/4 top-0 w-1/2 h-1/2 bg-gradient-radial from-orange-500/30 to-transparent rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-6">What Our Users Say</h2>
            <p className="text-black/60 dark:text-white/60 text-lg max-w-3xl mx-auto">
              Join thousands of home cooks who have transformed their cooking experience with Gourmet Bytes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br bg-gray-50 dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
              <div className="mb-6">
                {[1, 2, 3, 4, 5].map((star) => (  
                  <span key={star} className="text-orange-500">★</span>
                ))}
              </div>
              <p className="text-black/60 dark:text-white/60 mb-6 italic">
                &quot;I used to throw out so much food because I couldn&apos;t figure out what to make with random ingredients. Gourmet Bytes has completely changed that. Now I create amazing meals with whatever I have!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/15 rounded-full mr-4"></div>
                <div>
                  <h4 className="text-black dark:text-white font-medium">Sarah T.</h4>
                  <p className="text-black/60 dark:text-white/60 text-sm">Busy Professional</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br bg-gray-50 dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
              <div className="mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-orange-500">★</span>
                ))}
              </div>
              <p className="text-black/60 dark:text-white/60 mb-6 italic">
                &quot;The cooking tips from Gourmet Bytes have seriously improved my skills in the kitchen. I&apos;ve learned techniques I never would have discovered on my own. My family thinks I took cooking classes!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/15 rounded-full mr-4"></div>
                <div>
                  <h4 className="text-black dark:text-white font-medium">Michael J.</h4>
                  <p className="text-black/60 dark:text-white/60 text-sm">Home Cook Enthusiast</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br bg-gray-50 dark:from-dark-gradient-to dark:to-dark-card p-8 rounded-xl border border-gray-200 dark:border-white/10 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
              <div className="mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-orange-500">★</span>
                ))}
              </div>
              <p className="text-black/60 dark:text-white/60 mb-6 italic">
                &quot;As someone with multiple dietary restrictions, finding recipes has always been a challenge. Gourmet Bytes understands my needs and creates delicious recipes that respect my restrictions without sacrificing flavor.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/15 rounded-full mr-4"></div>
                <div>
                  <h4 className="text-black dark:text-white font-medium">Emily R.</h4>
                  <p className="text-black/60 dark:text-white/60 text-sm">Health-Conscious Individual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-red-700 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Cooking Experience?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-3xl mx-auto">
              Join Gourmet Bytes today and start creating delicious, personalized recipes with the ingredients you already have.
            </p>
            <Link
              href="/get-started"
              className="bg-white text-red-700 hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-all duration-300 shadow-xl shadow-red-900/20 inline-flex items-center text-lg"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-white/70 mt-4 text-sm">No credit card required. Start cooking in minutes.</p>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute left-1/4 top-1/4 w-1/2 h-1/2 bg-gradient-radial from-white/30 to-transparent rounded-full blur-3xl"></div>
        </div>
      </section>
    </main>
  );
}
