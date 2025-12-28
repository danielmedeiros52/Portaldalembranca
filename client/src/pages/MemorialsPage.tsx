import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { dataService, Memorial } from "@/services/dataService";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData, generateBreadcrumbSchema } from "@/components/StructuredData";
import { 
  QrCode, Search, Calendar, MapPin, ArrowLeft, 
  Users, Filter, ChevronRight, Landmark, Music, Heart
} from "lucide-react";
import { APP_TITLE } from "@/const";

export default function MemorialsPage() {
  const [, setLocation] = useLocation();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [filteredMemorials, setFilteredMemorials] = useState<Memorial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemorials = async () => {
      const data = await dataService.getMemorials();
      const publicMemorials = data.filter(m => m.status === 'active' && m.visibility === 'public');
      setMemorials(publicMemorials);
      setFilteredMemorials(publicMemorials);
      setLoading(false);
    };
    loadMemorials();
  }, []);

  useEffect(() => {
    let filtered = memorials;
    
    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.fullName.toLowerCase().includes(term) ||
        m.biography.toLowerCase().includes(term) ||
        m.birthplace.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(m => {
        if (selectedCategory === "historical") return m.isHistorical;
        if (selectedCategory === "family") return !m.isHistorical;
        if (selectedCategory === "politician") return m.category === "Político";
        if (selectedCategory === "artist") return m.category === "Artista";
        if (selectedCategory === "devotion") return m.category === "Devoção Popular";
        return true;
      });
    }
    
    setFilteredMemorials(filtered);
  }, [searchTerm, selectedCategory, memorials]);

  const categories = [
    { id: "all", label: "Todos", icon: Users },
    { id: "historical", label: "Patrimônio Histórico", icon: Landmark },
    { id: "politician", label: "Políticos", icon: Users },
    { id: "artist", label: "Artistas", icon: Music },
    { id: "devotion", label: "Devoção Popular", icon: Heart },
    { id: "family", label: "Familiares", icon: Users },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: 'https://portaldalembranca.com.br/' },
    { name: 'Memoriais' },
  ]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SEO */}
      <SEOHead
        title="Memoriais - Portal da Lembrança | Homenagens e Biografias"
        description="Explore memoriais digitais de personalidades históricas de Pernambuco e homenagens a entes queridos. Joaquim Nabuco, Chico Science, Miguel Arraes e mais."
        url="https://portaldalembranca.com.br/memoriais"
        keywords={['memoriais', 'biografias', 'homenagens', 'patrimônio histórico', 'pernambuco', 'cemitério santo amaro']}
      />
      <StructuredData data={breadcrumbSchema} />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">{APP_TITLE}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Memoriais
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Explore homenagens a personalidades históricas de Pernambuco e memoriais de entes queridos
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, local ou biografia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredMemorials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum memorial encontrado.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {filteredMemorials.length} memorial{filteredMemorials.length !== 1 ? 'is' : ''} encontrado{filteredMemorials.length !== 1 ? 's' : ''}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemorials.map((memorial) => (
                  <article
                    key={memorial.id}
                    onClick={() => setLocation(`/m/${memorial.slug}`)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-teal-100 to-teal-50 relative overflow-hidden">
                      {memorial.mainPhoto ? (
                        <img 
                          src={memorial.mainPhoto} 
                          alt={memorial.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-teal-200">
                            {memorial.fullName.charAt(0)}
                          </span>
                        </div>
                      )}
                      {memorial.isHistorical && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <Landmark className="w-3 h-3" />
                          Patrimônio Histórico
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                        {memorial.fullName}
                      </h2>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(memorial.birthDate)} - {formatDate(memorial.deathDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{memorial.birthplace}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {memorial.biography.split('\n\n')[0].substring(0, 120)}...
                      </p>
                      
                      <div className="flex items-center text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
                        Ver memorial
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
