import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { dataService, Memorial, Descendant, Photo, Dedication } from "@/services/dataService";
import { 
  ArrowLeft, Save, User, Users, Image, MessageSquare, 
  Plus, Trash2, Edit3, Calendar, MapPin, Heart, Upload
} from "lucide-react";

export default function MemorialEditPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const memorialId = parseInt(params.id || "1");

  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [descendants, setDescendants] = useState<Descendant[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [showAddDescendant, setShowAddDescendant] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    deathDate: "",
    birthplace: "",
    filiation: "",
    biography: "",
  });

  const [descendantForm, setDescendantForm] = useState({
    name: "",
    relationship: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [memorialData, descendantsData, photosData, dedicationsData] = await Promise.all([
        dataService.getMemorialById(memorialId),
        dataService.getDescendantsByMemorialId(memorialId),
        dataService.getPhotosByMemorialId(memorialId),
        dataService.getDedicationsByMemorialId(memorialId)
      ]);
      
      if (memorialData) {
        setMemorial(memorialData);
        setFormData({
          fullName: memorialData.fullName,
          birthDate: memorialData.birthDate,
          deathDate: memorialData.deathDate,
          birthplace: memorialData.birthplace,
          filiation: memorialData.filiation,
          biography: memorialData.biography,
        });
      }
      setDescendants(descendantsData || []);
      setPhotos(photosData || []);
      setDedications(dedicationsData || []);
    };
    loadData();
  }, [memorialId]);

  const handleSave = async () => {
    if (!memorial) return;
    try {
      const updated = await dataService.updateMemorial(memorial.id, {
        fullName: formData.fullName,
        birthDate: formData.birthDate || undefined,
        deathDate: formData.deathDate || undefined,
        birthplace: formData.birthplace || undefined,
        parents: formData.filiation || undefined,
        biography: formData.biography || undefined,
      });
      setMemorial(updated);
      toast.success("Memorial atualizado.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível atualizar o memorial.");
    }
  };

  const handleAddDescendant = () => {
    toast.success("Familiar adicionado.");
    setShowAddDescendant(false);
    setDescendantForm({ name: "", relationship: "" });
  };

  const handleAddPhoto = () => {
    toast.success("Foto adicionada.");
    setShowAddPhoto(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!memorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/dashboard/family")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Editar Memorial</h1>
                <p className="text-sm text-gray-500">{memorial.fullName}</p>
              </div>
            </div>
            <Button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Memorial Header Card */}
        <div className="card-modern p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative group">
              <img 
                src={memorial.mainPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(memorial.fullName)}&background=0F766E&color=fff&size=128`}
                alt={memorial.fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover"
              />
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{memorial.fullName}</h2>
              <div className="flex items-center gap-6 text-gray-500 mb-4">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {memorial.birthDate?.split('-')[0]} - {memorial.deathDate?.split('-')[0]}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {memorial.birthplace}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="badge-success">Ativo</span>
                <span className="badge-info">Público</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-1">
            <TabsTrigger value="info" className="flex items-center gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 text-xs sm:text-sm px-2 sm:px-3">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Info</span>
              <span className="hidden sm:inline">rmações</span>
            </TabsTrigger>
            <TabsTrigger value="descendants" className="flex items-center gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 text-xs sm:text-sm px-2 sm:px-3">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Família</span>
              <span className="hidden sm:inline">res ({descendants.length})</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 text-xs sm:text-sm px-2 sm:px-3">
              <Image className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Fotos</span>
              <span className="hidden sm:inline"> ({photos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="dedications" className="flex items-center gap-1 sm:gap-2 rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 text-xs sm:text-sm px-2 sm:px-3">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Homen</span>
              <span className="hidden sm:inline">agens ({dedications.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="card-modern p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Informações Pessoais</h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naturalidade</label>
                  <input
                    value={formData.birthplace}
                    onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Falecimento</label>
                  <input
                    type="date"
                    value={formData.deathDate}
                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filiação</label>
                  <input
                    value={formData.filiation}
                    onChange={(e) => setFormData({ ...formData, filiation: e.target.value })}
                    placeholder="Ex: Filho(a) de João Silva e Maria Santos"
                    className="input-modern"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                  <textarea
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    rows={8}
                    className="input-modern resize-none"
                    placeholder="Conte a história de vida..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Descendants Tab */}
          <TabsContent value="descendants">
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Familiares</h3>
                <Dialog open={showAddDescendant} onOpenChange={setShowAddDescendant}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Adicionar Familiar</DialogTitle>
                      <DialogDescription>Adicione um membro da família ao memorial</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                        <input
                          value={descendantForm.name}
                          onChange={(e) => setDescendantForm({ ...descendantForm, name: e.target.value })}
                          className="input-modern"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco</label>
                        <select
                          value={descendantForm.relationship}
                          onChange={(e) => setDescendantForm({ ...descendantForm, relationship: e.target.value })}
                          className="input-modern"
                        >
                          <option value="">Selecione...</option>
                          <option value="Filho(a)">Filho(a)</option>
                          <option value="Neto(a)">Neto(a)</option>
                          <option value="Bisneto(a)">Bisneto(a)</option>
                          <option value="Cônjuge">Cônjuge</option>
                          <option value="Irmão(ã)">Irmão(ã)</option>
                          <option value="Sobrinho(a)">Sobrinho(a)</option>
                        </select>
                      </div>
                      <Button onClick={handleAddDescendant} className="w-full btn-primary">
                        Adicionar Familiar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {descendants.map((descendant, index) => (
                  <div 
                    key={descendant.id} 
                    className="group p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-300 fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={descendant.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(descendant.name)}&background=0F766E&color=fff&size=48`}
                        alt={descendant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{descendant.name}</p>
                        <p className="text-sm text-gray-500">{descendant.relationship}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Galeria de Fotos</h3>
                <Dialog open={showAddPhoto} onOpenChange={setShowAddPhoto}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Foto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Adicionar Foto</DialogTitle>
                      <DialogDescription>Faça upload de uma nova foto para o memorial</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Arraste uma foto ou clique para selecionar</p>
                        <p className="text-sm text-gray-400">PNG, JPG até 10MB</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Legenda</label>
                        <input className="input-modern" placeholder="Descreva a foto..." />
                      </div>
                      <Button onClick={handleAddPhoto} className="w-full btn-primary">
                        Adicionar Foto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="group relative rounded-xl overflow-hidden fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <img 
                      src={photo.fileUrl}
                      alt={photo.caption}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-sm">{photo.caption}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button className="p-1.5 bg-white/90 rounded-lg hover:bg-white">
                          <Edit3 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="p-1.5 bg-white/90 rounded-lg hover:bg-white">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Dedications Tab */}
          <TabsContent value="dedications">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Dedicações Recebidas</h3>
              <div className="space-y-4">
                {dedications.map((dedication, index) => (
                  <div 
                    key={dedication.id} 
                    className="p-5 bg-gray-50 rounded-xl fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={dedication.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(dedication.authorName)}&background=0F766E&color=fff&size=48`}
                        alt={dedication.authorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{dedication.authorName}</p>
                            <p className="text-sm text-gray-500">{formatDate(dedication.createdAt)}</p>
                          </div>
                          <Heart className="w-5 h-5 text-rose-400" />
                        </div>
                        <p className="text-gray-600 leading-relaxed">{dedication.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
