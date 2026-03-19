/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, hasValidSupabaseConfig, updateSupabaseConfig } from "./lib/supabase";
import { 
  Wind, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Leaf,
  Droplets,
  Zap,
  Settings,
  Cloud,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Smartphone,
  Link as LinkIcon,
  Image as ImageIcon,
  Type
} from "lucide-react";

// --- Types ---

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  discountedPrice?: number;
  benefits: string[];
  activation: string;
  instructions?: {
    aplicacao: string;
    fechamento: string;
  };
  links: { label: string; url: string }[];
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  image?: string;
  type: 'text' | 'image';
}

interface BannerData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
}

interface TherapistData {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
}

interface Therapy {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CMSData {
  products: Product[];
  testimonials: Testimonial[];
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    shopee: string;
  };
  logoUrl: string;
  banner: BannerData;
  therapist: TherapistData;
  therapies: Therapy[];
}

// --- Initial Data ---

const INITIAL_DATA: CMSData = {
  logoUrl: "https://images.unsplash.com/photo-1611095773767-1168040b89b9?auto=format&fit=crop&q=80&w=200",
  banner: {
    title: "A Magia dos",
    subtitle: "Sprays Radiestésicos",
    description: "Descubra o poder da aromaterapia aliada à radiestesia. Nossos sprays são formulados para alinhar sua energia e transformar seu ambiente.",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=1000",
    buttonText: "Ver Coleção"
  },
  therapist: {
    name: "Andréa",
    role: "Terapeuta Radiestesista",
    description: "Desenvolvedora da linha KHEPRE, Andréa combina anos de estudo em radiestesia e aromaterapia para criar produtos que não apenas perfumam, mas transformam a vibração do seu campo energético.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    buttonText: "Conhecer Terapias",
    buttonUrl: "https://wa.me/5500000000000"
  },
  therapies: [
    { id: "1", title: "Aura Mater", description: "Terapia focada na limpeza e equilíbrio do campo áurico, trazendo clareza e proteção espiritual.", icon: "Sparkles" },
    { id: "2", title: "Aromaterapia", description: "Uso terapêutico de óleos essenciais para promover o bem-estar físico, emocional e vibracional.", icon: "Leaf" },
    { id: "3", title: "Mesa Radionica", description: "Ferramenta de cura quântica que permite diagnosticar e harmonizar diversas áreas da vida.", icon: "Zap" },
    { id: "4", title: "Radiestesia", description: "Detecção e medição de energias sutis para identificar desequilíbrios em ambientes e pessoas.", icon: "Wind" },
    { id: "5", title: "Grupos de Imersão", description: "Vivências coletivas para aprofundamento no autoconhecimento e práticas de cura energética.", icon: "Droplets" }
  ],
  products: [
    {
      id: "1",
      name: "Hora do Sono",
      description: "Durma melhor e acorde renovado(a)! O Spray Hora do Sono é perfeito para quem busca um descanso profundo e restaurador, aliviando o estresse e preparando seu corpo e mente para um novo dia com mais disposição.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800", 
      price: 129.90,
      discountedPrice: 89.90,
      benefits: ["Descanso Profundo", "Alívio de Estresse", "Mente Calma"],
      activation: "Eu desacelero e encontro paz. Meu corpo relaxa, minha mente silencia. Eu me entrego a um sono profundo e restaurador.",
      instructions: {
        aplicacao: "Borrife suavemente e permita que seu corpo relaxe.",
        fechamento: "Respire devagar e deixe o descanso te envolver."
      },
      links: [
        { label: "WhatsApp", url: "https://wa.me/5500000000000" },
        { label: "Shopee", url: "https://shopee.com.br" }
      ]
    }
  ],
  testimonials: [
    { id: "1", name: "Mariana Silva", role: "Arquiteta", text: "O spray Hora do Sono mudou minhas noites. Sinto um relaxamento imediato assim que borrifo no travesseiro.", type: 'text' }
  ],
  socialLinks: {
    instagram: "https://instagram.com/khepre",
    facebook: "https://facebook.com/khepre",
    whatsapp: "https://wa.me/5500000000000",
    shopee: "https://shopee.com.br/khepre"
  }
};

// --- Helpers ---

const calculateDiscount = (price: any, discounted?: any) => {
  const p = typeof price === 'number' ? price : Number(price);
  const d = typeof discounted === 'number' ? discounted : Number(discounted);
  if (isNaN(p) || isNaN(d) || !d || d >= p) return 0;
  return Math.round(((p - d) / p) * 100);
};

const formatPrice = (val: any) => {
  const n = typeof val === 'number' ? val : Number(val);
  return isNaN(n) ? "0.00" : n.toFixed(2);
};

// --- Components ---

function FilePicker({ onFileSelect, label }: { onFileSelect: (base64: string) => void, label: string }) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="admin-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <label
          htmlFor={`file-upload-${label}`}
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
        >
          <ImageIcon size={16} /> Carregar do PC
        </label>
      </div>
    </div>
  );
}

export default function App() {
  const [cmsData, setCmsData] = useState<CMSData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(hasValidSupabaseConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [showErrorScreen, setShowErrorScreen] = useState(false);

  // Fetch from Supabase on mount
  useEffect(() => {
    if (!hasValidSupabaseConfig) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      // Set a timeout to avoid infinite loading
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setSupabaseError("A conexão com o Supabase está demorando muito. Verifique sua internet ou as chaves configuradas.");
          setShowErrorScreen(true);
        }
      }, 10000);

      try {
        if (!supabase) {
          throw new Error("Cliente Supabase não inicializado.");
        }

        const { data, error } = await supabase
          .from('khepre_cms')
          .select('data')
          .eq('id', 1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, use default
            setSupabaseError(null);
          } else if (error.code === '42P01') {
            // Relation does not exist
            setSupabaseError("Tabela 'khepre_cms' não encontrada no seu banco de dados Supabase.");
            setShowErrorScreen(true);
          } else {
            setSupabaseError(`Erro Supabase (${error.code}): ${error.message}`);
            setShowErrorScreen(true);
          }
        } else if (data) {
          // Merge with INITIAL_DATA to ensure new fields are present
          const parsed = data.data || {};
          
          // Robust merging
          const mergedProducts = (Array.isArray(parsed.products) ? parsed.products : INITIAL_DATA.products).map((p: any) => ({
            ...p,
            id: p.id || Date.now().toString() + Math.random(),
            name: p.name || "Produto sem nome",
            description: p.description || "",
            image: p.image || "",
            price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
            discountedPrice: p.discountedPrice !== undefined ? (typeof p.discountedPrice === 'number' ? p.discountedPrice : Number(p.discountedPrice) || 0) : undefined,
            benefits: Array.isArray(p.benefits) ? p.benefits : [],
            activation: p.activation || "",
            links: Array.isArray(p.links) ? p.links : []
          }));

          setCmsData({
            ...INITIAL_DATA,
            ...parsed,
            products: mergedProducts,
            banner: parsed.banner ? { ...INITIAL_DATA.banner, ...parsed.banner } : INITIAL_DATA.banner,
            therapist: parsed.therapist ? { ...INITIAL_DATA.therapist, ...parsed.therapist } : INITIAL_DATA.therapist,
            therapies: Array.isArray(parsed.therapies) ? parsed.therapies : INITIAL_DATA.therapies,
            testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : INITIAL_DATA.testimonials,
            socialLinks: parsed.socialLinks ? { ...INITIAL_DATA.socialLinks, ...parsed.socialLinks } : INITIAL_DATA.socialLinks
          });
          setSupabaseError(null);
        }
      } catch (e: any) {
        console.error("Error fetching from Supabase:", e);
        setSupabaseError(e.message || "Erro desconhecido ao conectar com Supabase.");
        setShowErrorScreen(true);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save to Supabase when data changes
  useEffect(() => {
    if (isLoading || !hasValidSupabaseConfig) return;

    const saveData = async () => {
      setIsSaving(true);
      try {
        await supabase
          .from('khepre_cms')
          .upsert({ id: 1, data: cmsData, updated_at: new Date().toISOString() });
      } catch (e) {
        console.error("Error saving to Supabase:", e);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(saveData, 3000); // 3s debounce to avoid too many writes
    return () => clearTimeout(timer);
  }, [cmsData, isLoading]);

  const handleLogin = (user: string, pass: string) => {
    if (user === "admin" && pass === "@ndre@04") {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert("Login ou senha incorretos.");
    }
  };

  if (isAdmin) {
    return (
      <div className="relative">
        {isSaving && (
          <div className="fixed top-4 right-4 z-[100] bg-khepre-dark text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
            <Sparkles size={14} className="animate-spin" /> Salvando na nuvem...
          </div>
        )}
        {!hasValidSupabaseConfig && (
          <div className="fixed bottom-4 right-4 z-[100] bg-red-500 text-white px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-lg">
            <ShieldCheck size={12} /> Nuvem Desconectada - Vá em Configurações
          </div>
        )}
        <AdminPanel 
          data={cmsData} 
          setData={setCmsData} 
          onLogout={() => setIsAdmin(false)} 
          supabaseError={supabaseError}
        />
      </div>
    );
  }

  if (isLoading || showErrorScreen) {
    return (
      <div className="min-h-screen bg-khepre-cream flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          {!supabaseError ? (
            <>
              <Wind size={48} className="text-khepre-olive animate-spin mb-4 mx-auto" />
              <p className="text-khepre-dark font-serif tracking-widest">CARREGANDO KHEPRE...</p>
            </>
          ) : (
            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-red-100">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                <X size={32} />
              </div>
              <h2 className="text-xl font-serif font-bold text-khepre-dark mb-4">Erro de Conexão</h2>
              <p className="text-khepre-dark/60 text-sm mb-6 leading-relaxed">
                {supabaseError}
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setSupabaseError(null);
                    setShowErrorScreen(false);
                    setIsLoading(false);
                  }}
                  className="w-full bg-khepre-dark text-white py-3 rounded-xl font-bold text-xs hover:bg-khepre-olive transition-all"
                >
                  Continuar com Dados Locais
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full border border-khepre-gold text-khepre-gold py-3 rounded-xl font-bold text-xs hover:bg-khepre-gold/5 transition-all"
                >
                  Tentar Novamente
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('khepre_supabase_url');
                    localStorage.removeItem('khepre_supabase_key');
                    window.location.reload();
                  }}
                  className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
                >
                  Resetar Configurações Supabase
                </button>
              </div>

              {supabaseError.includes("Tabela 'khepre_cms' não encontrada") && (
                <p className="mt-6 text-[10px] text-khepre-dark/40 italic">
                  Dica: Você pode entrar no Painel Admin (usuário/senha padrão) e pegar o script SQL para criar a tabela no seu Supabase.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-khepre-gold/30 overflow-x-hidden">
      <LandingPage data={cmsData} onAdminClick={() => setShowLogin(true)} />
      
      <AnimatePresence>
        {showLogin && (
          <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Admin Panel ---

function AdminPanel({ data, setData, onLogout, supabaseError }: { data: CMSData; setData: (d: CMSData) => void; onLogout: () => void; supabaseError: string | null }) {
  const [activeTab, setActiveTab] = useState<'products' | 'testimonials' | 'banner' | 'therapist' | 'therapies' | 'settings'>('products');
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('khepre_supabase_url') || "");
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('khepre_supabase_key') || "");

  const updateSocial = (key: keyof CMSData['socialLinks'], value: string) => {
    setData({ ...data, socialLinks: { ...data.socialLinks, [key]: value } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-khepre-dark text-white p-6 flex flex-col">
        <h2 className="text-2xl font-serif font-bold mb-10 tracking-widest">KHEPRE ADM</h2>
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'products' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <Zap size={18} /> Produtos
          </button>
          <button 
            onClick={() => setActiveTab('banner')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'banner' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <ImageIcon size={18} /> Banner Principal
          </button>
          <button 
            onClick={() => setActiveTab('therapist')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'therapist' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <Leaf size={18} /> Terapeuta
          </button>
          <button 
            onClick={() => setActiveTab('therapies')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'therapies' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <Sparkles size={18} /> Terapias
          </button>
          <button 
            onClick={() => setActiveTab('testimonials')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'testimonials' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <MessageCircle size={18} /> Relatos
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-khepre-gold text-white' : 'hover:bg-white/10'}`}
          >
            <Settings size={18} /> Configurações
          </button>
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto max-h-screen">
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-serif">Gerenciar Produtos</h3>
              <button 
                onClick={() => {
                  const newProd: Product = {
                    id: Date.now().toString(),
                    name: "Novo Produto",
                    description: "",
                    image: "",
                    price: 0,
                    benefits: [],
                    activation: "",
                    links: []
                  };
                  setData({ ...data, products: [...data.products, newProd] });
                }}
                className="bg-khepre-dark text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-khepre-olive transition-all"
              >
                <Plus size={18} /> Adicionar Produto
              </button>
            </div>

            <div className="grid gap-6">
              {data.products.map(product => (
                <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <FilePicker 
                      label="Imagem do Produto" 
                      onFileSelect={base64 => {
                        const newProds = data.products.map(p => p.id === product.id ? { ...p, image: base64 } : p);
                        setData({ ...data, products: newProds });
                      }} 
                    />
                    <div className="pt-2">
                      <label className="admin-label">Ou URL da Imagem</label>
                      <input 
                        className="admin-input" 
                        value={product.image} 
                        onChange={e => {
                          const newProds = data.products.map(p => p.id === product.id ? { ...p, image: e.target.value } : p);
                          setData({ ...data, products: newProds });
                        }}
                      />
                    </div>
                    {product.image && <img src={product.image} className="w-full aspect-square object-cover rounded-lg shadow-inner" />}
                  </div>
                  <div className="space-y-4 col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="admin-label">Nome</label>
                        <input 
                          className="admin-input" 
                          value={product.name} 
                          onChange={e => {
                            const newProds = data.products.map(p => p.id === product.id ? { ...p, name: e.target.value } : p);
                            setData({ ...data, products: newProds });
                          }}
                        />
                      </div>
                      <div>
                        <label className="admin-label">Preço Original (R$)</label>
                        <input 
                          type="number"
                          className="admin-input" 
                          value={product.price} 
                          onChange={e => {
                            const newProds = data.products.map(p => p.id === product.id ? { ...p, price: Number(e.target.value) } : p);
                            setData({ ...data, products: newProds });
                          }}
                        />
                      </div>
                      <div>
                        <label className="admin-label">Preço com Desconto (R$)</label>
                        <input 
                          type="number"
                          className="admin-input" 
                          value={product.discountedPrice || ""} 
                          onChange={e => {
                            const newProds = data.products.map(p => p.id === product.id ? { ...p, discountedPrice: e.target.value ? Number(e.target.value) : undefined } : p);
                            setData({ ...data, products: newProds });
                          }}
                        />
                        {product.discountedPrice && (
                          <p className="text-xs text-green-600 font-bold mt-1">
                            Desconto de {calculateDiscount(product.price, product.discountedPrice)}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">Descrição</label>
                      <textarea 
                        className="admin-input h-24" 
                        value={product.description} 
                        onChange={e => {
                          const newProds = data.products.map(p => p.id === product.id ? { ...p, description: e.target.value } : p);
                          setData({ ...data, products: newProds });
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Afirmação de Ativação</label>
                      <input 
                        className="admin-input" 
                        value={product.activation} 
                        onChange={e => {
                          const newProds = data.products.map(p => p.id === product.id ? { ...p, activation: e.target.value } : p);
                          setData({ ...data, products: newProds });
                        }}
                      />
                    </div>
                    
                    {/* Links Section */}
                    <div>
                      <label className="admin-label">Links de Compra</label>
                      <div className="space-y-2">
                        {product.links.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input 
                              placeholder="Label (ex: WhatsApp)" 
                              className="admin-input flex-1" 
                              value={link.label}
                              onChange={e => {
                                const newLinks = [...product.links];
                                newLinks[idx].label = e.target.value;
                                const newProds = data.products.map(p => p.id === product.id ? { ...p, links: newLinks } : p);
                                setData({ ...data, products: newProds });
                              }}
                            />
                            <input 
                              placeholder="URL" 
                              className="admin-input flex-[2]" 
                              value={link.url}
                              onChange={e => {
                                const newLinks = [...product.links];
                                newLinks[idx].url = e.target.value;
                                const newProds = data.products.map(p => p.id === product.id ? { ...p, links: newLinks } : p);
                                setData({ ...data, products: newProds });
                              }}
                            />
                            <button 
                              onClick={() => {
                                const newLinks = product.links.filter((_, i) => i !== idx);
                                const newProds = data.products.map(p => p.id === product.id ? { ...p, links: newLinks } : p);
                                setData({ ...data, products: newProds });
                              }}
                              className="text-red-500 p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newLinks = [...product.links, { label: "", url: "" }];
                            const newProds = data.products.map(p => p.id === product.id ? { ...p, links: newLinks } : p);
                            setData({ ...data, products: newProds });
                          }}
                          className="text-xs font-bold text-khepre-gold flex items-center gap-1 mt-2"
                        >
                          <Plus size={14} /> Adicionar Link
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este produto?")) {
                            setData({ ...data, products: data.products.filter(p => p.id !== product.id) });
                          }
                        }}
                        className="text-red-500 flex items-center gap-2 text-sm font-bold"
                      >
                        <Trash2 size={18} /> Excluir Produto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banner' && (
          <div className="space-y-8 max-w-4xl">
            <h3 className="text-3xl font-serif">Editar Banner Principal</h3>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FilePicker 
                  label="Imagem do Banner" 
                  onFileSelect={base64 => setData({ ...data, banner: { ...data.banner, imageUrl: base64 } })} 
                />
                <div className="pt-2">
                  <label className="admin-label">Ou URL da Imagem</label>
                  <input 
                    className="admin-input" 
                    value={data.banner.imageUrl} 
                    onChange={e => setData({ ...data, banner: { ...data.banner, imageUrl: e.target.value } })}
                  />
                </div>
                {data.banner.imageUrl && <img src={data.banner.imageUrl} className="w-full aspect-video object-cover rounded-xl shadow-lg" />}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Título (Linha 1)</label>
                  <input className="admin-input" value={data.banner.title} onChange={e => setData({ ...data, banner: { ...data.banner, title: e.target.value } })} />
                </div>
                <div>
                  <label className="admin-label">Subtítulo (Destaque)</label>
                  <input className="admin-input" value={data.banner.subtitle} onChange={e => setData({ ...data, banner: { ...data.banner, subtitle: e.target.value } })} />
                </div>
                <div>
                  <label className="admin-label">Descrição</label>
                  <textarea className="admin-input h-32" value={data.banner.description} onChange={e => setData({ ...data, banner: { ...data.banner, description: e.target.value } })} />
                </div>
                <div>
                  <label className="admin-label">Texto do Botão</label>
                  <input className="admin-input" value={data.banner.buttonText} onChange={e => setData({ ...data, banner: { ...data.banner, buttonText: e.target.value } })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'therapist' && (
          <div className="space-y-8 max-w-4xl">
            <h3 className="text-3xl font-serif">Editar Seção da Terapeuta</h3>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FilePicker 
                  label="Foto da Terapeuta" 
                  onFileSelect={base64 => setData({ ...data, therapist: { ...data.therapist, imageUrl: base64 } })} 
                />
                <div className="pt-2">
                  <label className="admin-label">Ou URL da Foto</label>
                  <input 
                    className="admin-input" 
                    value={data.therapist.imageUrl} 
                    onChange={e => setData({ ...data, therapist: { ...data.therapist, imageUrl: e.target.value } })}
                  />
                </div>
                {data.therapist.imageUrl && <img src={data.therapist.imageUrl} className="w-full aspect-square object-cover rounded-xl shadow-lg" />}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Nome</label>
                  <input className="admin-input" value={data.therapist.name} onChange={e => setData({ ...data, therapist: { ...data.therapist, name: e.target.value } })} />
                </div>
                <div>
                  <label className="admin-label">Cargo/Título</label>
                  <input className="admin-input" value={data.therapist.role} onChange={e => setData({ ...data, therapist: { ...data.therapist, role: e.target.value } })} />
                </div>
                <div>
                  <label className="admin-label">Descrição/Biografia</label>
                  <textarea className="admin-input h-32" value={data.therapist.description} onChange={e => setData({ ...data, therapist: { ...data.therapist, description: e.target.value } })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Texto do Botão</label>
                    <input className="admin-input" value={data.therapist.buttonText} onChange={e => setData({ ...data, therapist: { ...data.therapist, buttonText: e.target.value } })} />
                  </div>
                  <div>
                    <label className="admin-label">URL do Botão</label>
                    <input className="admin-input" value={data.therapist.buttonUrl} onChange={e => setData({ ...data, therapist: { ...data.therapist, buttonUrl: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'therapies' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-serif">Gerenciar Terapias</h3>
              <button 
                onClick={() => {
                  const newTherapy: Therapy = {
                    id: Date.now().toString(),
                    title: "Nova Terapia",
                    description: "",
                    icon: "Sparkles"
                  };
                  setData({ ...data, therapies: [...data.therapies, newTherapy] });
                }}
                className="bg-khepre-dark text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-khepre-olive transition-all"
              >
                <Plus size={18} /> Adicionar Terapia
              </button>
            </div>

            <div className="grid gap-6">
              {data.therapies.map((therapy) => (
                <div key={therapy.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="admin-label">Título</label>
                      <input 
                        className="admin-input" 
                        value={therapy.title} 
                        onChange={e => {
                          const newTherapies = data.therapies.map(t => t.id === therapy.id ? { ...t, title: e.target.value } : t);
                          setData({ ...data, therapies: newTherapies });
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Ícone (Lucide)</label>
                      <select 
                        className="admin-input" 
                        value={therapy.icon} 
                        onChange={e => {
                          const newTherapies = data.therapies.map(t => t.id === therapy.id ? { ...t, icon: e.target.value } : t);
                          setData({ ...data, therapies: newTherapies });
                        }}
                      >
                        <option value="Sparkles">Sparkles</option>
                        <option value="Leaf">Leaf</option>
                        <option value="Zap">Zap</option>
                        <option value="Wind">Wind</option>
                        <option value="Droplets">Droplets</option>
                        <option value="Moon">Moon</option>
                        <option value="ShieldCheck">ShieldCheck</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="admin-label">Descrição</label>
                      <textarea 
                        className="admin-input h-24" 
                        value={therapy.description} 
                        onChange={e => {
                          const newTherapies = data.therapies.map(t => t.id === therapy.id ? { ...t, description: e.target.value } : t);
                          setData({ ...data, therapies: newTherapies });
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => {
                          if (confirm("Excluir esta terapia?")) {
                            setData({ ...data, therapies: data.therapies.filter(t => t.id !== therapy.id) });
                          }
                        }}
                        className="text-red-500 flex items-center gap-2 text-sm font-bold"
                      >
                        <Trash2 size={18} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-serif">Gerenciar Relatos</h3>
              <button 
                onClick={() => {
                  const newTest: Testimonial = {
                    id: Date.now().toString(),
                    name: "Novo Cliente",
                    role: "Cliente",
                    text: "",
                    type: 'text'
                  };
                  setData({ ...data, testimonials: [...data.testimonials, newTest] });
                }}
                className="bg-khepre-dark text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-khepre-olive transition-all"
              >
                <Plus size={18} /> Adicionar Relato
              </button>
            </div>

            <div className="grid gap-6">
              {data.testimonials.map(test => (
                <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, type: 'text' as const } : t);
                        setData({ ...data, testimonials: newTests });
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${test.type === 'text' ? 'bg-khepre-gold text-white' : 'bg-gray-100'}`}
                    >
                      <Type size={16} /> Texto
                    </button>
                    <button 
                      onClick={() => {
                        const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, type: 'image' as const } : t);
                        setData({ ...data, testimonials: newTests });
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${test.type === 'image' ? 'bg-khepre-gold text-white' : 'bg-gray-100'}`}
                    >
                      <ImageIcon size={16} /> Imagem
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Nome</label>
                      <input 
                        className="admin-input" 
                        value={test.name} 
                        onChange={e => {
                          const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, name: e.target.value } : t);
                          setData({ ...data, testimonials: newTests });
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Cargo/Papel</label>
                      <input 
                        className="admin-input" 
                        value={test.role} 
                        onChange={e => {
                          const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, role: e.target.value } : t);
                          setData({ ...data, testimonials: newTests });
                        }}
                      />
                    </div>
                  </div>

                  {test.type === 'text' ? (
                    <div>
                      <label className="admin-label">Relato (Texto)</label>
                      <textarea 
                        className="admin-input h-24" 
                        value={test.text} 
                        onChange={e => {
                          const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, text: e.target.value } : t);
                          setData({ ...data, testimonials: newTests });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FilePicker 
                        label="Imagem do Relato" 
                        onFileSelect={base64 => {
                          const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, image: base64 } : t);
                          setData({ ...data, testimonials: newTests });
                        }} 
                      />
                      <div>
                        <label className="admin-label">Ou URL da Imagem</label>
                        <input 
                          className="admin-input" 
                          value={test.image} 
                          onChange={e => {
                            const newTests = data.testimonials.map(t => t.id === test.id ? { ...t, image: e.target.value } : t);
                            setData({ ...data, testimonials: newTests });
                          }}
                        />
                      </div>
                      {test.image && <img src={test.image} className="mt-4 max-h-48 rounded-lg shadow-md" />}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        if (confirm("Excluir este relato?")) {
                          setData({ ...data, testimonials: data.testimonials.filter(t => t.id !== test.id) });
                        }
                      }}
                      className="text-red-500 flex items-center gap-2 text-sm font-bold"
                    >
                      <Trash2 size={18} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-2xl pb-20">
            <h3 className="text-3xl font-serif">Configurações Gerais</h3>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
              {/* Supabase Config Section */}
              <div className="space-y-4 p-6 bg-khepre-yellow/20 rounded-2xl border border-khepre-yellow/30">
                <h4 className="text-sm font-bold uppercase tracking-widest text-khepre-gold flex items-center gap-2">
                  <Cloud size={16} /> Sincronização em Nuvem (Supabase)
                </h4>
                <p className="text-[10px] text-khepre-dark/60 leading-relaxed">
                  Insira as chaves do seu projeto Supabase para que as alterações sejam salvas permanentemente e apareçam em todos os dispositivos.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="admin-label">Supabase URL</label>
                    <input 
                      className="admin-input bg-white" 
                      placeholder="https://xxxx.supabase.co"
                      value={supabaseUrl} 
                      onChange={e => setSupabaseUrl(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="admin-label">Supabase Anon Key</label>
                    <input 
                      type="password"
                      className="admin-input bg-white" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKey} 
                      onChange={e => setSupabaseKey(e.target.value)} 
                    />
                  </div>
                  <button 
                    onClick={() => {
                      updateSupabaseConfig(supabaseUrl, supabaseKey);
                      alert("Configurações salvas! O site irá reiniciar.");
                    }}
                    className="w-full bg-khepre-gold text-white py-3 rounded-xl font-bold text-xs hover:bg-khepre-dark transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Save size={14} /> Salvar e Conectar Nuvem
                  </button>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <Smartphone size={14} /> Dica para Mobile (Celular)
                    </h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      As chaves inseridas acima ficam salvas apenas <strong>neste navegador</strong>. 
                      Para que as alterações apareçam no seu celular, você tem duas opções:
                    </p>
                    <ul className="text-[10px] text-blue-700 mt-2 list-disc pl-4 space-y-1">
                      <li>Entre no painel pelo celular e insira as mesmas chaves uma única vez.</li>
                      <li><strong>Recomendado:</strong> Adicione as chaves <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nos <strong>Secrets (Configurações)</strong> do AI Studio. Assim o site já abrirá configurado em qualquer dispositivo automaticamente.</li>
                    </ul>
                  </div>
                </div>

                {hasValidSupabaseConfig && (
                  <div className="mt-6 space-y-4 pt-6 border-t border-khepre-gold/20">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-khepre-gold flex items-center gap-2">
                      <Settings size={14} /> Configuração do Banco de Dados
                    </h4>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-[10px] text-green-700 flex items-center gap-2 font-bold mb-1">
                        <ShieldCheck size={12} /> Conectado com Sucesso
                      </p>
                      <p className="text-[9px] text-green-600 leading-relaxed">
                        Seu site está pronto para salvar na nuvem. Se as tabelas ainda não foram criadas no seu Supabase, siga as instruções abaixo.
                      </p>
                    </div>

                    {supabaseError && (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                        <p className="text-[10px] text-red-700 flex items-center gap-2 font-bold mb-1">
                          <X size={12} /> Erro na Tabela
                        </p>
                        <p className="text-[9px] text-red-600 leading-relaxed">
                          {supabaseError}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="admin-label text-khepre-dark">Script SQL para Criar Tabelas</label>
                      <p className="text-[9px] text-gray-500 mb-2">
                        Copie o código abaixo, vá no seu painel do Supabase → <b>SQL Editor</b> → <b>New Query</b>, cole e clique em <b>Run</b>.
                      </p>
                      <div className="relative group">
                        <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-[9px] overflow-x-auto font-mono leading-relaxed max-h-40">
{`-- Cria a tabela para armazenar os dados do site
create table if not exists khepre_cms (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Insere a linha inicial de dados
insert into khepre_cms (id, data) 
values (1, '{}')
on conflict (id) do nothing;

-- Habilita o acesso público para leitura e escrita
alter table khepre_cms enable row level security;
create policy "Acesso público total" on khepre_cms for all using (true) with check (true);`}
                        </pre>
                        <button 
                          onClick={() => {
                            const sql = `-- Cria a tabela para armazenar os dados do site\ncreate table if not exists khepre_cms (\n  id int primary key default 1,\n  data jsonb not null,\n  updated_at timestamp with time zone default now()\n);\n\n-- Insere a linha inicial de dados\ninsert into khepre_cms (id, data) \nvalues (1, '{}')\non conflict (id) do nothing;\n\n-- Habilita o acesso público para leitura e escrita\nalter table khepre_cms enable row level security;\ncreate policy "Acesso público total" on khepre_cms for all using (true) with check (true);`;
                            navigator.clipboard.writeText(sql);
                            alert("Script SQL copiado!");
                          }}
                          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[8px] transition-all"
                        >
                          Copiar SQL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FilePicker 
                  label="Logo da Marca" 
                  onFileSelect={base64 => setData({ ...data, logoUrl: base64 })} 
                />
                <div>
                  <label className="admin-label">Ou URL do Logo</label>
                  <input 
                    className="admin-input" 
                    value={data.logoUrl} 
                    onChange={e => setData({ ...data, logoUrl: e.target.value })}
                  />
                </div>
                {data.logoUrl && <img src={data.logoUrl} className="mt-4 h-16 object-contain" />}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b pb-2">Redes Sociais</h4>
                <div>
                  <label className="admin-label">Instagram</label>
                  <input className="admin-input" value={data.socialLinks.instagram} onChange={e => updateSocial('instagram', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Facebook</label>
                  <input className="admin-input" value={data.socialLinks.facebook} onChange={e => updateSocial('facebook', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">WhatsApp Geral</label>
                  <input className="admin-input" value={data.socialLinks.whatsapp} onChange={e => updateSocial('whatsapp', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Link Shopee</label>
                  <input className="admin-input" value={data.socialLinks.shopee} onChange={e => updateSocial('shopee', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Login Modal ---

function LoginModal({ onLogin, onClose }: { onLogin: (u: string, p: string) => void; onClose: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-khepre-dark">
          <X size={24} />
        </button>
        <h3 className="text-3xl font-serif mb-8 text-center">Acesso Restrito</h3>
        <div className="space-y-4">
          <div>
            <label className="admin-label">Usuário</label>
            <input 
              className="admin-input" 
              value={user} 
              onChange={e => setUser(e.target.value)} 
              autoComplete="new-username"
            />
          </div>
          <div>
            <label className="admin-label">Senha</label>
            <input 
              type="password" 
              className="admin-input" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              autoComplete="new-password"
            />
          </div>
          <button 
            onClick={() => onLogin(user, pass)}
            className="w-full bg-khepre-dark text-white py-4 rounded-xl font-bold mt-6 hover:bg-khepre-olive transition-all"
          >
            Entrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Landing Page ---

function LandingPage({ data, onAdminClick }: { data: CMSData; onAdminClick: () => void }) {
  return (
    <>
      {/* Navigation */}
      <nav className="relative w-full z-50 bg-khepre-yellow border-b border-khepre-dark/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {data.logoUrl ? (
              <img 
                src={data.logoUrl} 
                alt="KHEPRE Logo" 
                className="w-[180px] h-[150px] md:w-[300px] md:h-[250px] object-contain" 
              />
            ) : (
              <span className="text-xl md:text-2xl font-serif tracking-widest font-bold text-khepre-dark">KHEPRE</span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-bold text-khepre-dark">
            <a href="#produtos" className="hover:text-khepre-olive transition-colors">Produtos</a>
            <a href="#radiestesia" className="hover:text-khepre-olive transition-colors">Radiestesia</a>
            <a href="#sobre" className="hover:text-khepre-olive transition-colors">Sobre</a>
            <a href={data.socialLinks.whatsapp} target="_blank" className="bg-khepre-dark text-white px-6 py-2 rounded-full hover:bg-khepre-olive transition-all">Comprar Agora</a>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onAdminClick} className="text-khepre-dark/60 hover:text-khepre-dark transition-colors">
              <Settings size={20} />
            </button>
            <button className="md:hidden text-khepre-dark">
              <Wind size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-20 right-10 w-96 h-96 bg-khepre-yellow rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-khepre-olive rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-khepre-gold uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Equilíbrio & Bem-estar
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-8xl leading-[1.1] md:leading-[0.9] mb-6">
              {data.banner.title} <br />
              <span className="serif-italic text-khepre-olive break-words">{data.banner.subtitle}</span>
            </h1>
            <p className="text-lg text-khepre-dark/70 max-w-md mb-8 leading-relaxed">
              {data.banner.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={data.socialLinks.whatsapp} target="_blank" className="bg-khepre-dark text-white px-8 py-4 rounded-full flex items-center gap-2 hover:bg-khepre-olive transition-all group">
                {data.banner.buttonText} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#produtos" className="border border-khepre-dark/20 px-8 py-4 rounded-full hover:bg-white transition-all flex items-center gap-2">
                <Wind size={18} /> Ver Produtos
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-khepre-yellow/10 rounded-[40px] overflow-hidden relative">
              <img 
                src={data.banner.imageUrl} 
                alt="KHEPRE Banner" 
                className="w-full h-full object-cover mix-blend-multiply opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-khepre-cream/80 to-transparent" />
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-[200px]"
            >
              <div className="flex items-center gap-2 text-khepre-gold mb-2">
                <Sparkles size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Energia Ativa</span>
              </div>
              <p className="text-sm font-medium">Fórmulas exclusivas ativadas por radiestesia.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Leaf className="text-khepre-olive" />, title: "100% Natural", desc: "Óleos essenciais puros e extratos botânicos." },
              { icon: <Zap className="text-khepre-gold" />, title: "Radiestesia", desc: "Frequências medidas para o seu equilíbrio." },
              { icon: <Droplets className="text-blue-400" />, title: "Artesanal", desc: "Produzido em pequenos lotes com intenção." },
              { icon: <ShieldCheck className="text-green-500" />, title: "Cruelty Free", desc: "Sem testes em animais ou químicos nocivos." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl hover:bg-khepre-cream transition-colors group">
                <div className="mb-4 p-3 bg-khepre-cream rounded-xl w-fit group-hover:bg-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-khepre-dark/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Nossa Coleção</h2>
            <p className="text-khepre-dark/60 max-w-xl mx-auto">
              Cada spray é uma jornada sensorial e energética. Escolha o que mais ressoa com o seu momento atual.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {data.products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-khepre-dark/5 flex flex-col"
              >
                  <div className="aspect-square overflow-hidden relative group">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      {product.discountedPrice ? (
                        <>
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            -{calculateDiscount(product.price, product.discountedPrice)}% OFF
                          </div>
                          <div className="bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold shadow-md">
                            <span className="text-gray-400 line-through text-xs mr-2">R$ {formatPrice(product.price)}</span>
                            <span className="text-khepre-dark">R$ {formatPrice(product.discountedPrice)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold shadow-md">
                          R$ {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                  </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl mb-3">{product.name}</h3>
                  <p className="text-sm text-khepre-dark/60 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-khepre-dark/5">
                    <p className="text-[10px] uppercase tracking-widest text-khepre-dark/40 mb-2 font-bold">Ritual de Ativação</p>
                    <p className="text-sm italic text-khepre-olive mb-3">"{product.activation}"</p>
                    {product.instructions && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-khepre-dark/40 leading-tight">
                          <span className="font-bold">Aplicação:</span> {product.instructions.aplicacao}
                        </p>
                        <p className="text-[10px] text-khepre-dark/40 leading-tight">
                          <span className="font-bold">Fechamento:</span> {product.instructions.fechamento}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 space-y-2">
                    <a 
                      href={`${data.socialLinks.whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto: ${product.name}`)}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 bg-khepre-dark text-white py-3 rounded-xl font-bold hover:bg-khepre-olive transition-all text-sm"
                    >
                      <MessageCircle size={16} /> Comprar via WhatsApp
                    </a>
                    {product.links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 bg-khepre-cream text-khepre-dark py-3 rounded-xl font-bold hover:bg-khepre-dark/10 transition-all text-sm"
                      >
                        <LinkIcon size={16} /> {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Radiestesia Section */}
      <section id="radiestesia" className="py-24 bg-khepre-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-khepre-olive/10 -skew-x-12 translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <span className="text-khepre-gold uppercase tracking-[0.3em] text-sm font-semibold mb-4 block">
              Ciência & Intuição
            </span>
            <h2 className="text-5xl md:text-6xl mb-8">O que é a <br /><span className="serif-italic text-khepre-gold">Radiestesia?</span></h2>
            <div className="space-y-6 text-white/70 leading-relaxed">
              <p>
                A radiestesia é a sensibilidade a radiações e frequências energéticas. Através dela, conseguimos medir e equilibrar as vibrações de ambientes e pessoas.
              </p>
              <p>
                Na <span className="text-white font-bold">KHEPRE</span>, utilizamos instrumentos radiestésicos para selecionar e potencializar as combinações de óleos essenciais.
              </p>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000" 
              alt="Radiestesia" 
              className="rounded-[40px] shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-khepre-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-2">Relatos de Bem-estar</h2>
            <p className="serif-italic text-xl text-khepre-olive">O que dizem sobre a experiência KHEPRE</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {data.testimonials.map((t) => (
              <div key={t.id} className="bg-white p-10 rounded-[32px] shadow-sm flex flex-col">
                {t.type === 'image' && t.image ? (
                  <img src={t.image} className="w-full rounded-2xl mb-6 object-cover aspect-video" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex gap-1 text-khepre-gold mb-6">
                    {[...Array(5)].map((_, i) => <Sparkles key={i} size={14} fill="currentColor" />)}
                  </div>
                )}
                {t.text && <p className="text-lg mb-8 text-khepre-dark/80 leading-relaxed">"{t.text}"</p>}
                <div className="mt-auto">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs uppercase tracking-widest text-khepre-dark/40">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapist Section */}
      <section id="sobre" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-khepre-yellow/20 rounded-[48px] p-8 md:p-16 grid md:grid-cols-2 gap-16 items-center relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-khepre-gold/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="aspect-square rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src={data.therapist.imageUrl} 
                  alt={data.therapist.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-khepre-dark text-white p-6 rounded-2xl shadow-xl">
                <p className="text-xs uppercase tracking-widest font-bold text-khepre-gold mb-1">Desenvolvido por</p>
                <p className="text-xl font-serif">{data.therapist.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-khepre-gold uppercase tracking-[0.3em] text-sm font-semibold block">
                Conheça a Criadora
              </span>
              <h2 className="text-5xl font-serif leading-tight">
                Equilíbrio guiado por <br />
                <span className="serif-italic text-khepre-olive">quem entende de energia.</span>
              </h2>
              <p className="text-lg text-khepre-dark/70 leading-relaxed">
                {data.therapist.description}
              </p>
              <div className="pt-4">
                <a 
                  href={data.therapist.buttonUrl} 
                  target="_blank"
                  className="inline-flex items-center gap-3 bg-khepre-dark text-white px-10 py-5 rounded-full font-bold hover:bg-khepre-olive transition-all shadow-lg hover:shadow-khepre-olive/20"
                >
                  <MessageCircle size={20} /> {data.therapist.buttonText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapies List Section */}
      <section className="py-24 bg-khepre-cream/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-khepre-gold uppercase tracking-[0.3em] text-sm font-semibold mb-4 block">
              Nossos Atendimentos
            </span>
            <h2 className="text-4xl md:text-5xl mb-4">Terapias de <span className="serif-italic text-khepre-olive">Harmonização</span></h2>
            <p className="text-khepre-dark/60 max-w-2xl mx-auto">
              Além dos sprays, oferecemos atendimentos personalizados para auxiliar no seu processo de cura e equilíbrio energético.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {data.therapies.map((therapy) => {
              const IconComponent = {
                Sparkles, Leaf, Zap, Wind, Droplets, Moon, ShieldCheck
              }[therapy.icon] || Sparkles;

              return (
                <motion.div 
                  key={therapy.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[32px] shadow-sm border border-khepre-dark/5 hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-khepre-yellow/30 rounded-2xl flex items-center justify-center text-khepre-gold mb-6 group-hover:bg-khepre-gold group-hover:text-white transition-all">
                    <IconComponent size={28} />
                  </div>
                  <h3 className="text-2xl mb-4">{therapy.title}</h3>
                  <p className="text-khepre-dark/60 text-sm leading-relaxed">
                    {therapy.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-white pt-24 pb-12 border-t border-khepre-dark/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-6">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="KHEPRE Logo" className="h-10 md:h-14 w-auto object-contain" />
                ) : (
                  <h2 className="text-xl md:text-3xl font-serif font-bold tracking-widest">KHEPRE</h2>
                )}
              </div>
              <p className="text-khepre-dark/60 max-w-sm mb-8">
                Transformando ambientes e elevando frequências através do poder da natureza e da radiestesia.
              </p>
              <div className="flex gap-4">
                <a href={data.socialLinks.instagram} target="_blank" className="w-12 h-12 rounded-full border border-khepre-dark/10 flex items-center justify-center hover:bg-khepre-dark hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href={data.socialLinks.facebook} target="_blank" className="w-12 h-12 rounded-full border border-khepre-dark/10 flex items-center justify-center hover:bg-khepre-dark hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
                <a href={data.socialLinks.whatsapp} target="_blank" className="w-12 h-12 rounded-full border border-khepre-dark/10 flex items-center justify-center hover:bg-khepre-dark hover:text-white transition-all">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Links Rápidos</h4>
              <ul className="space-y-4 text-khepre-dark/60">
                <li><a href="#" className="hover:text-khepre-gold">Início</a></li>
                <li><a href="#produtos" className="hover:text-khepre-gold">Produtos</a></li>
                <li><a href="#radiestesia" className="hover:text-khepre-gold">Radiestesia</a></li>
                <li><a href={data.socialLinks.shopee} target="_blank" className="hover:text-khepre-gold">Nossa Loja Shopee</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Newsletter</h4>
              <p className="text-xs text-khepre-dark/60 mb-4">Receba dicas de bem-estar e ofertas exclusivas.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Seu e-mail" className="bg-khepre-cream px-4 py-2 rounded-lg flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-khepre-gold" />
                <button className="bg-khepre-dark text-white px-4 py-2 rounded-lg text-sm font-bold">OK</button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-khepre-dark/5 flex flex-col md:row items-center justify-between gap-6">
            <p className="text-xs text-khepre-dark/40">
              © 2024 KHEPRE Sprays Radiestésicos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
