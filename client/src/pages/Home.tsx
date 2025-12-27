import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { Heart, QrCode, Users, Shield, Sparkles, ArrowRight, Star } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-teal-700"
              onClick={() => setLocation("/m/maria-silva-santos")}
            >
              Ver Demo
            </Button>
            <Button 
              onClick={() => setLocation("/login")} 
              className="btn-primary"
            >
              Entrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 float" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Versão piloto em Pernambuco
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Honre memórias com{" "}
              <span className="text-gradient">tecnologia</span> e cuidado{" "}
              <span className="text-gradient-rose">local</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Memoriais digitais com QR Code no túmulo, preparados para o dia a dia das funerárias pernambucanas e para famílias que querem preservar histórias em um ambiente seguro e perene.
            </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setLocation("/login")} 
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => setLocation("/m/maria-silva-santos")}
                  variant="outline"
                  className="btn-outline"
                >
                  Ver Exemplo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-gray-900">15 min</p>
                  <p className="text-sm text-gray-500">Tempo médio para ativar um memorial</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">4 parceiros</p>
                  <p className="text-sm text-gray-500">Funerárias e cemitérios em Recife/RMR</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">Placa + QR</p>
                  <p className="text-sm text-gray-500">Entrega pronta para ser fixada no túmulo</p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Card */}
            <div className="relative fade-in stagger-2">
              <div className="relative">
                {/* Main Card */}
                <div className="card-modern p-6 max-w-md mx-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
                      alt="Memorial"
                      className="w-16 h-16 avatar"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">Maria Silva Santos</h3>
                      <p className="text-sm text-gray-500">1945 - 2024</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Maria foi uma mulher dedicada à família e à comunidade. Sua paixão pela jardinagem transformou sua casa em um verdadeiro jardim botânico...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 avatar" alt="" />
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 avatar" alt="" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 avatar" alt="" />
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-medium text-teal-700 ring-2 ring-white">+4</div>
                    </div>
                    <span className="text-sm text-gray-500">4 dedicações</span>
                  </div>
                </div>

                {/* Floating QR Code */}
                <div className="absolute -right-4 -bottom-4 card-modern p-4 pulse-glow">
                  <QrCode className="w-16 h-16 text-teal-600" />
                </div>

                {/* Floating Badge */}
                <div className="absolute -left-4 top-1/4 card-modern px-4 py-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-medium text-gray-700">Memorial Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <div className="section-divider mb-6"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma solução completa para funerárias, famílias e acervos históricos criarem memoriais digitais significativos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-modern p-8 fade-in stagger-1">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Para Funerárias</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                  </div>
                  Ative um memorial junto com o contrato do funeral
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                  </div>
                  Gere código QR e acompanhe a produção da placa
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                  </div>
                  Painel com comissões e status dos memoriais
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card-modern p-8 fade-in stagger-2">
              <div className="w-14 h-14 rounded-2xl gradient-secondary flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Para Famílias</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                  </div>
                  Preencha biografia, fotos e homenagens com segurança
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                  </div>
                  Registre descendentes e mantenha a árvore da família
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                  </div>
                  Compartilhe o link ou QR para toda a rede de afetos
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card-modern p-8 fade-in stagger-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Para Patrimônio</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
                  </div>
                  Mapeie túmulos de relevância histórica e cultural
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
                  </div>
                  Disponibilize QR Codes para acervo público e visitas guiadas
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
                  </div>
                  Baseie roteiros educativos e turismo de memória em dados confiáveis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">O Que Dizem Nossos Clientes</h2>
            <div className="section-divider"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card-modern p-6 fade-in stagger-1">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Conseguimos organizar fotos, biografia e descendentes da minha avó em poucas horas. A placa com QR Code já está no túmulo e a família inteira consegue acessar sem complicação."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face"
                  alt="Ana Paula"
                  className="w-12 h-12 avatar"
                />
                <div>
                  <p className="font-medium text-gray-900">Ana Paula Silva</p>
                  <p className="text-sm text-gray-500">Família</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card-modern p-6 fade-in stagger-2">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Apresentamos o memorial durante a contratação e a família costuma aceitar na hora. O painel com status e comissões ajuda nossa equipe a acompanhar cada caso." 
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
                  alt="Roberto"
                  className="w-12 h-12 avatar"
                />
                <div>
                  <p className="font-medium text-gray-900">Roberto Mendes</p>
                  <p className="text-sm text-gray-500">Funerária Paz Eterna</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card-modern p-6 fade-in stagger-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Estamos catalogando túmulos históricos do Recife e colocando QR Codes para quem visita. O acervo online virou referência para roteiros educativos." 
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face"
                  alt="Mariana"
                  className="w-12 h-12 avatar"
                />
                <div>
                  <p className="font-medium text-gray-900">Mariana Costa</p>
                  <p className="text-sm text-gray-500">Visitante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative gradient-hero rounded-3xl p-12 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">Pronto para pilotar?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Conecte sua funerária ou família ao Portal da Lembrança em Pernambuco e valide a experiência com QR Codes, placas físicas e suporte dedicado.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/login")}
                  className="bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  Solicitar acesso ao piloto
                </Button>
                <Button 
                  onClick={() => setLocation("/m/maria-silva-santos")}
                  variant="outline"
                  className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Ver Demonstração
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Sobre</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 {APP_TITLE}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
