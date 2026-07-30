import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, Product, ProductVariation, Category } from '../types';
import { useProducts } from '../context/ProductContext';
import { ProductService } from '../services/product.service';
import { supabase } from '../lib/supabase';
import { motion } from "motion/react";
import { Plus, Trash2, Edit3, X, Package, TrendingUp, Users, RefreshCw, ShieldCheck, DollarSign, ArrowUpRight, ShoppingBag, Terminal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Textarea } from "../../components/ui/textarea";
import { IMAGES } from "../constants/images";

const SIZE_OPTIONS = ['P', 'M', 'G', 'GG', 'XG', '38', '39', '40', '41', '42', '43', '44', '46', 'Único'];
const COLOR_OPTIONS = ['Preto', 'Branco', 'Cinza', 'Azul Marinho', 'Verde Militar', 'Bege', 'Vermelho', 'Bordô', 'Caramelo'];

interface AdminProps {
  profile: UserProfile | null;
}

export default function Admin({ profile }: AdminProps) {
  console.log('Admin component mounted. Profile:', profile || 'undefined');
  const navigate = useNavigate();
  
  const { products: contextProducts, refreshProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariations, setProductVariations] = useState<Record<string, ProductVariation[]>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: undefined,
    category: 'camisa',
    stock: 0,
    description: '',
    imageUrl: '',
    images: [],
    sku: '',
    sizes: [],
    colors: []
  });

  const [newVariationForm, setNewVariationForm] = useState<Partial<ProductVariation>>({
    size: '',
    color: '',
    stock_quantity: 0,
    images: [],
    sku: ''
  });

  const [editingVariation, setEditingVariation] = useState<Partial<ProductVariation> | null>(null);
  const [showEditVariationForm, setShowEditVariationForm] = useState(false);

  const [imageInput, setImageInput] = useState('');
  const [editImageInput, setEditImageInput] = useState('');

  // 1. Sync products from context
  useEffect(() => {
    if (contextProducts) {
      setProducts(contextProducts);
      // Load variations for all products
      contextProducts.forEach(product => {
        loadProductVariations(product.id);
      });
    }
  }, [contextProducts]);

  // Load variations for a specific product
  const loadProductVariations = async (productId: string) => {
    try {
      const { data: variations } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);
      
      setProductVariations(prev => ({
        ...prev,
        [productId]: variations || []
      }));
    } catch (err) {
      console.error('Error loading variations:', err);
    }
  };

  // Proactive Access Guard logic
  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-display uppercase mb-4 text-orange-500">Carregando Perfil...</h2>
        <p className="text-gray-400 max-w-xs text-sm">Verificando permissões de acesso.</p>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-display uppercase mb-4 text-orange-500">Acesso Restrito</h2>
        <p className="text-gray-400 max-w-xs text-sm mb-4">Apenas curadores oficiais da Real Store podem acessar o painel de inventário.</p>
        <p className="text-gray-300 text-xs">Seu perfil atual: {profile.role}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-display uppercase mb-4 text-red-500">Erro ao Carregar</h2>
        <p className="text-gray-400 max-w-md text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 text-white text-xs uppercase tracking-widest font-bold hover:bg-orange-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // 2. Calculations for Registered Items
  const totalRegisteredProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

  // 3. Calculations for Sold Items (Orders)
  const totalOrdersCount = orders.length;
  const totalRevenueAccrued = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalUnitsSoldCount = orders.reduce((acc, o) => {
    const qty = o.items?.reduce((s: number, item: any) => s + (item.quantity || 1), 0) || 0;
    return acc + qty;
  }, 0);

  // Form Adding Helpers
  const addImageUrl = () => {
    if (imageInput && !newProductForm.images?.includes(imageInput)) {
      setNewProductForm(prev => ({
        ...prev,
        images: [...(prev.images || []), imageInput],
        imageUrl: prev.imageUrl || imageInput
      }));
      setImageInput('');
    }
  };

  const removeImageUrl = (url: string) => {
    setNewProductForm(prev => ({
      ...prev,
      images: prev.images?.filter(u => u !== url) || []
    }));
  };

  const toggleSize = (size: string) => {
    setNewProductForm(prev => ({
      ...prev,
      sizes: prev.sizes?.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...(prev.sizes || []), size]
    }));
  };

  const toggleColor = (color: string) => {
    setNewProductForm(prev => ({
      ...prev,
      colors: prev.colors?.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...(prev.colors || []), color]
    }));
  };

  // Form Editing Helpers
  const addEditImageUrl = () => {
    if (editImageInput && !editingProduct?.images?.includes(editImageInput)) {
      setEditingProduct(prev => prev ? ({
        ...prev,
        images: [...(prev.images || []), editImageInput],
        imageUrl: prev.imageUrl || editImageInput
      }) : null);
      setEditImageInput('');
    }
  };

  const removeEditImageUrl = (url: string) => {
    setEditingProduct(prev => prev ? ({
      ...prev,
      images: prev.images?.filter(u => u !== url) || []
    }) : null);
  };

  // Add variation to product
  const handleAddVariation = async () => {
    if (!selectedProductId || !newVariationForm.size || !newVariationForm.color) {
      alert('Preencha tamanho e cor');
      return;
    }

    try {
      const result = await ProductService.createVariation({
        product_id: selectedProductId,
        size: newVariationForm.size,
        color: newVariationForm.color,
        stock_quantity: Number(newVariationForm.stock_quantity),
        images: newVariationForm.images || [],
        sku: newVariationForm.sku || `${newVariationForm.size}-${newVariationForm.color}`,
        is_active: true
      } as any);

      if (result.error) {
        alert('Erro ao criar variação: ' + result.error.message);
        return;
      }

      // Reload variations first to get updated list
      await loadProductVariations(selectedProductId);
      
      // Update total stock in product using the freshly loaded variations
      const updatedVariations = productVariations[selectedProductId] || [];
      const totalStock = updatedVariations.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
      
      await ProductService.updateProduct(selectedProductId, { stock_quantity: totalStock } as any);
      await refreshProducts();

      setNewVariationForm({
        size: '',
        color: '',
        stock_quantity: 0,
        images: [],
        sku: ''
      });
      setShowVariationForm(false);
    } catch (err) {
      console.error('Erro ao criar variação:', err);
      alert('Erro ao criar variação');
    }
  };

  // Delete variation
  const handleDeleteVariation = async (variationId: string, productId?: string) => {
    const targetProductId = productId || selectedProductId || editingProduct?.id;
    if (!targetProductId) return;

    try {
      await ProductService.deleteVariation(variationId);
      await loadProductVariations(targetProductId);
      await refreshProducts();
    } catch (err) {
      console.error('Erro ao deletar variação:', err);
      alert('Erro ao deletar variação');
    }
  };

  // Edit variation
  const handleEditVariation = async () => {
    if (!editingVariation?.id) return;

    try {
      const result = await ProductService.updateVariation(editingVariation.id, {
        size: editingVariation.size,
        color: editingVariation.color,
        stock_quantity: Number(editingVariation.stock_quantity),
        images: editingVariation.images || [],
        sku: editingVariation.sku || `${editingVariation.size}-${editingVariation.color}`,
        is_active: true
      } as any);

      if (result.error) {
        alert('Erro ao atualizar variação: ' + result.error.message);
        return;
      }

      const targetProductId = selectedProductId || editingProduct?.id;
      if (targetProductId) {
        await loadProductVariations(targetProductId);
        
        // Update total stock in product
        const updatedVariations = productVariations[targetProductId] || [];
        const totalStock = updatedVariations.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
        
        await ProductService.updateProduct(targetProductId, { stock_quantity: totalStock } as any);
        await refreshProducts();
      }

      setEditingVariation(null);
      setShowEditVariationForm(false);
    } catch (err) {
      console.error('Erro ao atualizar variação:', err);
      alert('Erro ao atualizar variação');
    }
  };

  const handleAddProduct = async () => {
    console.log('Tentando cadastrar produto:', newProductForm);
    if (!newProductForm.name) {
      console.error('Validação falhou: nome vazio');
      return;
    }
    
    try {
      // Generate automatic SKU if not provided
      let sku = newProductForm.sku;
      if (!sku) {
        const categoryPrefix = newProductForm.category === 'camisa' ? 'CAM' :
                             newProductForm.category === 'jaquetas' ? 'JAC' :
                             newProductForm.category === 'tenis' ? 'TEN' :
                             newProductForm.category === 'relogios' ? 'REL' :
                             newProductForm.category === 'calça' ? 'CAL' :
                             newProductForm.category === 'bone' ? 'BON' :
                             newProductForm.category === 'bermuda' ? 'BER' :
                             newProductForm.category === 'oculos' ? 'OCU' :
                             newProductForm.category === 'sandalias' ? 'SAN' : 'PRO';
        
        // Find existing SKUs with this prefix
        const existingSkus = products
          .filter((p: any) => p.sku && p.sku.startsWith(categoryPrefix))
          .map((p: any) => {
            const match = p.sku.match(new RegExp(`^${categoryPrefix}-(\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
          });
        
        const maxNumber = existingSkus.length > 0 ? Math.max(...existingSkus) : 0;
        sku = `${categoryPrefix}-${(maxNumber + 1).toString().padStart(3, '0')}`;
      }
      
      // Get category_id from category name
      const categorySlug = newProductForm.category;
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      
      const categoryId = categoryData?.id || null;
      
      const productData = {
        name: newProductForm.name,
        description: newProductForm.description || '',
        price: Number(newProductForm.price),
        compare_at_price: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : null,
        stock_quantity: 0,
        sku: sku,
        images: newProductForm.images || [],
        category_id: categoryId,
        is_active: true,
        is_featured: false,
        slug: newProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      };
      
      console.log('Dados enviados para Supabase:', productData);
      
      const result = await ProductService.createProduct(productData as any);
      console.log('Resultado do createProduct:', result);
      
      if (result.error) {
        console.error('Erro ao criar produto:', result.error);
        alert('Erro ao cadastrar produto: ' + result.error.message);
        return;
      }

      // Create variations - always create at least one default variation
      if (newProductForm.sizes && newProductForm.sizes.length > 0 && 
          newProductForm.colors && newProductForm.colors.length > 0 && result.product) {
        
        for (const size of newProductForm.sizes) {
          for (const color of newProductForm.colors) {
            await ProductService.createVariation({
              product_id: result.product.id,
              size: size,
              color: color,
              stock_quantity: newProductForm.stock || 0,
              images: newProductForm.images || [],
              sku: `${sku}-${size}-${color.substring(0, 3).toUpperCase()}`,
              is_active: true
            } as any);
          }
        }
      } else if (result.product) {
        // Create default variation if no sizes/colors selected
        await ProductService.createVariation({
          product_id: result.product.id,
          size: 'Único',
          color: 'Preto',
          stock_quantity: newProductForm.stock || 0,
          images: newProductForm.images || [],
          sku: `${sku}-UNI-PRE`,
          is_active: true
        } as any);
      }
      
      setNewProductForm({
        name: '',
        price: 0,
        category: 'camisa',
        stock: 0,
        description: '',
        images: [],
        sku: '',
        sizes: [],
        colors: []
      });
      setShowAddForm(false);
      // Refresh products from context
      await refreshProducts();
      
      console.log('Produto cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro no handleAddProduct:', error);
      alert('Erro ao cadastrar produto: ' + (error as Error).message);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id || !editingProduct.name) return;
    
    // Get category_id from category name
    const categorySlug = editingProduct.category;
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    const categoryId = categoryData?.id || null;
    
    console.log('Atualizando produto:', editingProduct.id, editingProduct);
    
    const result = await ProductService.updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      compare_at_price: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : null,
      stock_quantity: Number(editingProduct.stock),
      description: editingProduct.description || '',
      images: editingProduct.images || [],
      sku: editingProduct.sku || '',
      category_id: categoryId
    } as any);
    
    if (result.error) {
      console.error('Erro ao atualizar produto:', result.error);
      alert('Erro ao atualizar produto: ' + result.error.message);
      return;
    }
    
    console.log('Produto atualizado com sucesso:', result.product);
    setEditingProduct(null);
    setShowEditForm(false);
    // Refresh products from context
    await refreshProducts();
  };

  const handleSeed = async () => {
    const initialProducts: any[] = [
      { 
        name: 'Camisa Linho Noir', 
        price: 289, 
        category: 'camisa', 
        stock: 15, 
        description: 'Elegante camisa de linho para noites de verão.', 
        images: [IMAGES.placeholders.product],
        sizes: ['M', 'G', 'GG'],
        colors: ['Preto', 'Bege'],
        sku: 'SZ-CAM-001'
      },
      { 
        name: 'Chrono Platinum', 
        price: 2450, 
        category: 'relogios', 
        stock: 4, 
        description: 'Movimento automático suíço com pulseira em couro legítimo.', 
        images: [IMAGES.categories.relogios],
        sizes: ['Único'],
        colors: ['Prata', 'Preto'],
        sku: 'SZ-WAT-55'
      },
      { 
        name: 'Runner Carbon-8', 
        price: 690, 
        category: 'tenis', 
        stock: 12, 
        description: 'Alta performance com design urbano futurista.', 
        images: [IMAGES.categories.tenis],
        sizes: ['40', '41', '42'],
        colors: ['Cinza', 'Preto'],
        sku: 'SZ-SHW-09'
      }
    ];

    for (const p of initialProducts) {
      await ProductService.createProduct({
        ...p,
        imageUrl: p.images[0],
        stock_quantity: p.stock,
        is_active: true,
        is_featured: false,
      } as any);
    }
    // Refresh products from context
    await refreshProducts();
  };

  return (
    <div className="pt-32 px-8 min-h-screen pb-24 bg-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-gray-200 pb-10">
        <div>
          <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-1">Administrative Control Layer</p>
          <h1 className="text-4xl font-serif italic text-gray-900">Manager <span className="text-orange-500 underline underline-offset-8 decoration-gray-200">Dashboard</span></h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSeed} className="rounded-none border-gray-300 text-gray-600 hover:border-orange-500 hover:text-gray-900 text-[10px] uppercase tracking-widest h-10 px-6 backdrop-blur-md">
            <RefreshCw className="w-3 h-3 mr-2" /> Alimentar Banc de Dados
          </Button>
          
          <Button 
            onClick={() => navigate('/pda-sales')}
            variant="outline"
            className="rounded-none border-green-500 text-green-600 hover:bg-green-50 text-[10px] uppercase tracking-widest h-10 px-6 font-bold"
          >
            <Terminal className="w-3 h-3 mr-2" /> PDA de Vendas
          </Button>
          
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gray-900 text-white hover:bg-orange-500 rounded-none text-[10px] uppercase tracking-widest h-10 px-6 font-bold"
          >
            <Plus className="w-3 h-3 mr-2" /> {showAddForm ? 'Cancelar' : 'Cadastrar Novo Item'}
          </Button>
        </div>
      </div>

      {/* Real balances of registered products & dynamic sales */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
        {[
          { label: 'Modelos Cadastrados', value: totalRegisteredProducts, icon: Package, color: 'text-orange-500' },
          { label: 'Unidades em Estoque', value: totalStockUnits, icon: ShieldCheck, color: 'text-blue-400' },
          { label: 'Valor em Inventário', value: `R$ ${totalInventoryValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-neutral-300' },
          { label: 'Vendas Acumuladas', value: `R$ ${totalRevenueAccrued.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Peças Descarregadas', value: totalUnitsSoldCount, icon: ShoppingBag, color: 'text-orange-500' },
          { label: 'Transações Emitidas', value: totalOrdersCount, icon: Terminal, color: 'text-blue-400' }
        ].map((stat, i) => (stat &&
          <div key={i} className="bg-gray-50 border border-gray-200 p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-center opacity-40">
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-600">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-light tracking-tighter text-gray-900 font-mono break-words">{stat.value}</p>
            <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Integrated Add Product Form - Step Wizard */}
      {showAddForm && !showEditForm && (
        <div className="bg-white border border-gray-200 mb-16 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6">
            <h2 className="text-2xl font-serif italic text-white">Cadastrar Novo Produto</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1">Complete as etapas abaixo para adicionar ao catálogo</p>
          </div>

          {/* Step Progress */}
          <div className="border-b border-gray-200 px-8 py-4 bg-gray-50">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
                    currentStep >= step 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all ${
                      currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-3xl mx-auto mt-3 text-[10px] uppercase tracking-widest">
              <span className={currentStep >= 1 ? 'text-orange-500 font-bold' : 'text-gray-400'}>Informações</span>
              <span className={currentStep >= 2 ? 'text-orange-500 font-bold' : 'text-gray-400'}>Preço & Estoque</span>
              <span className={currentStep >= 3 ? 'text-orange-500 font-bold' : 'text-gray-400'}>Variações</span>
              <span className={currentStep >= 4 ? 'text-orange-500 font-bold' : 'text-gray-400'}>Imagens</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Nome do Produto *</Label>
                  <Input 
                    placeholder="Ex: Camisa Polo Linho Noir" 
                    className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                    value={newProductForm.name}
                    onChange={e => setNewProductForm({...newProductForm, name: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Categoria *</Label>
                  <select 
                    className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    value={newProductForm.category}
                    onChange={e => setNewProductForm({...newProductForm, category: e.target.value as Category})}
                  >
                    <option value="camisa">Camisa</option>
                    <option value="camisa-street">Camisas Street</option>
                    <option value="camisa-time">Camisas de Time</option>
                    <option value="gola-polo">Gola Polo</option>
                    <option value="shorts">Shorts</option>
                    <option value="bone">Boné</option>
                    <option value="calça">Calça</option>
                    <option value="jaquetas">Jaqueta</option>
                    <option value="oculos">Óculos</option>
                    <option value="relogios">Relógio</option>
                    <option value="sandalias">Sandálias</option>
                    <option value="tenis">Tênis</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Descrição</Label>
                  <Textarea 
                    placeholder="Descreva os detalhes do produto..."
                    className="bg-white border-gray-300 rounded-lg min-h-[120px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm resize-none"
                    value={newProductForm.description}
                    onChange={e => setNewProductForm({...newProductForm, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Price & Stock */}
            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Preço (R$) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input 
                        type="number" 
                        className="bg-white border-gray-300 rounded-lg h-12 pl-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                        value={newProductForm.price}
                        onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500">Preço Anterior</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input 
                        type="number" 
                        placeholder="0,00"
                        className="bg-white border-gray-300 rounded-lg h-12 pl-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                        value={newProductForm.originalPrice || ''}
                        onChange={e => setNewProductForm({...newProductForm, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Estoque Inicial</Label>
                    <Input 
                      type="number" 
                      className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                      value={newProductForm.stock}
                      onChange={e => setNewProductForm({...newProductForm, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500">Código SKU</Label>
                    <Input 
                      placeholder="Opcional - gerado automaticamente"
                      className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                      value={newProductForm.sku}
                      onChange={e => setNewProductForm({...newProductForm, sku: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Variations */}
            {currentStep === 3 && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Tamanhos Disponíveis</Label>
                    <Button
                      onClick={() => setNewProductForm(prev => ({...prev, sizes: SIZE_OPTIONS}))}
                      variant="outline"
                      className="h-8 px-3 text-xs border-gray-300 hover:bg-gray-100"
                    >
                      Selecionar Todos
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {SIZE_OPTIONS.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`py-3 px-4 text-sm border rounded-lg transition-all font-medium ${
                          newProductForm.sizes?.includes(size)
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {newProductForm.sizes && newProductForm.sizes.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {newProductForm.sizes.length} tamanho(s) selecionado(s): {newProductForm.sizes.join(', ')}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Cores Disponíveis</Label>
                    <Button
                      onClick={() => setNewProductForm(prev => ({...prev, colors: COLOR_OPTIONS}))}
                      variant="outline"
                      className="h-8 px-3 text-xs border-gray-300 hover:bg-gray-100"
                    >
                      Selecionar Todas
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`py-3 px-4 text-sm border rounded-lg transition-all font-medium ${
                          newProductForm.colors?.includes(color)
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  {newProductForm.colors && newProductForm.colors.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {newProductForm.colors.length} cor(es) selecionada(s): {newProductForm.colors.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Images */}
            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Imagens do Produto</Label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Cole a URL da imagem aqui" 
                      className="bg-white border-gray-300 rounded-lg h-12 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      value={imageInput}
                      onChange={e => setImageInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addImageUrl()}
                    />
                    <Button 
                      onClick={addImageUrl}
                      className="h-12 px-6 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </Button>
                  </div>
                </div>

                {newProductForm.images && newProductForm.images.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500">Imagens Adicionadas ({newProductForm.images.length})</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {newProductForm.images.map((url, i) => (
                        <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={url} className="w-full h-full object-cover" alt={`Imagem ${i + 1}`} />
                          <button 
                            onClick={() => removeImageUrl(url)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 px-2 text-center">
                            {i === 0 ? 'Principal' : `#${i + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">Nenhuma imagem adicionada</p>
                    <p className="text-xs text-gray-400 mt-1">Adicione pelo menos uma imagem para o produto</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between">
            <Button 
              onClick={() => {
                if (currentStep > 1) setCurrentStep(currentStep - 1);
                else setShowAddForm(false);
              }}
              variant="outline"
              className="rounded-lg border-gray-300 hover:bg-gray-100 text-sm px-6 h-11"
            >
              {currentStep === 1 ? 'Cancelar' : '← Anterior'}
            </Button>
            <Button 
              onClick={() => {
                if (currentStep < 4) setCurrentStep(currentStep + 1);
                else handleAddProduct();
              }}
              className="rounded-lg bg-gray-900 text-white hover:bg-orange-500 text-sm px-6 h-11 font-medium"
              disabled={currentStep === 1 && !newProductForm.name}
            >
              {currentStep === 4 ? '✓ Cadastrar Produto' : 'Próximo →'}
            </Button>
          </div>
        </div>
      )}

      {/* Integrated Edit Product Form */}
      {showEditForm && editingProduct && (
        <div className="bg-white border border-gray-200 mb-16 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6">
            <h2 className="text-2xl font-serif italic text-white">Editar Produto</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1">Modifique as informações do produto</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Info */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Nome do Produto</Label>
                  <Input 
                    placeholder="Nome do produto" 
                    className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                    value={editingProduct.name || ""}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Preço (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input 
                        type="number" 
                        className="bg-white border-gray-300 rounded-lg h-12 pl-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                        value={editingProduct.price || 0}
                        onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500">Preço Anterior</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input 
                        type="number" 
                        placeholder="0,00"
                        className="bg-white border-gray-300 rounded-lg h-12 pl-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                        value={editingProduct.originalPrice || ''}
                        onChange={e => setEditingProduct({...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Estoque</Label>
                    <Input 
                      type="number" 
                      className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                      value={editingProduct.stock || 0}
                      onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500">Código SKU</Label>
                    <Input 
                      placeholder="SKU" 
                      className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                      value={editingProduct.sku || ""}
                      onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Categoria</Label>
                  <select 
                    className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    value={editingProduct.category || "camisa"}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})}
                  >
                    <option value="camisa">Camisa</option>
                    <option value="camisa-street">Camisas Street</option>
                    <option value="camisa-time">Camisas de Time</option>
                    <option value="gola-polo">Gola Polo</option>
                    <option value="shorts">Shorts</option>
                    <option value="bone">Boné</option>
                    <option value="calça">Calça</option>
                    <option value="jaquetas">Jaqueta</option>
                    <option value="oculos">Óculos</option>
                    <option value="relogios">Relógio</option>
                    <option value="sandalias">Sandálias</option>
                    <option value="tenis">Tênis</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Descrição</Label>
                  <Textarea 
                    className="bg-white border-gray-300 rounded-lg min-h-[120px] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm resize-none"
                    value={editingProduct.description || ""}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Right Column: Variations & Media */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Imagens do Produto</Label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Cole a URL da imagem aqui" 
                      className="bg-white border-gray-300 rounded-lg h-12 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      value={editImageInput}
                      onChange={e => setEditImageInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addEditImageUrl()}
                    />
                    <Button 
                      onClick={addEditImageUrl}
                      className="h-12 px-6 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </Button>
                  </div>
                  {editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                      {editingProduct.images.map((url, i) => (
                        <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={url} className="w-full h-full object-cover" alt={`Imagem ${i + 1}`} />
                          <button 
                            onClick={() => removeEditImageUrl(url)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variations Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Variações Cadastradas</Label>
                    <Button
                      onClick={() => {
                        setSelectedProductId(editingProduct.id);
                        setShowVariationForm(true);
                      }}
                      className="h-9 px-4 text-xs bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Nova Variação
                    </Button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    {productVariations[editingProduct.id || '']?.length === 0 ? (
                      <div className="p-6 text-center">
                        <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma variação cadastrada</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {productVariations[editingProduct.id || '']?.map((variation) => (
                          <div key={variation.id} className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{variation.size}</span>
                                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">{variation.color}</span>
                              </div>
                              <span className="text-xs text-gray-500">Estoque: {variation.stock_quantity}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingVariation(variation);
                                  setShowEditVariationForm(true);
                                }}
                                className="h-8 w-8 p-0 bg-blue-500 text-white hover:bg-blue-600 rounded-lg"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <Button
                                onClick={() => handleDeleteVariation(variation.id, editingProduct.id)}
                                className="h-8 w-8 p-0 bg-red-500 text-white hover:bg-red-600 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex gap-4">
            <Button 
              className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm px-6 h-11"
              onClick={() => {
                setShowEditForm(false);
                setEditingProduct(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-gray-900 text-white h-11 rounded-lg hover:bg-orange-500 text-sm font-medium"
              onClick={handleUpdateProduct}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {/* Variation Form Modal */}
      {showVariationForm && (
        <div className="bg-white border border-gray-200 mb-16 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6">
            <h2 className="text-2xl font-serif italic text-white">Adicionar Variação</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1">Configure tamanho, cor e estoque</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Tamanho *</Label>
                <select 
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  value={newVariationForm.size}
                  onChange={e => setNewVariationForm({...newVariationForm, size: e.target.value})}
                >
                  <option value="">Selecione o tamanho</option>
                  {SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Cor *</Label>
                <select 
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  value={newVariationForm.color}
                  onChange={e => setNewVariationForm({...newVariationForm, color: e.target.value})}
                >
                  <option value="">Selecione a cor</option>
                  {COLOR_OPTIONS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Estoque *</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                  value={newVariationForm.stock_quantity}
                  onChange={e => setNewVariationForm({...newVariationForm, stock_quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Images for Variation */}
            <div className="space-y-4">
              <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Fotos da Variação (Opcional)</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="Cole a URL da imagem aqui"
                  className="bg-white border-gray-300 rounded-lg h-12 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm flex-1"
                  value={imageInput}
                  onChange={e => setImageInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (() => {
                    if (imageInput) {
                      setNewVariationForm({
                        ...newVariationForm,
                        images: [...(newVariationForm.images || []), imageInput]
                      });
                      setImageInput('');
                    }
                  })()}
                />
                <Button
                  onClick={() => {
                    if (imageInput) {
                      setNewVariationForm({
                        ...newVariationForm,
                        images: [...(newVariationForm.images || []), imageInput]
                      });
                      setImageInput('');
                    }
                  }}
                  className="h-12 px-6 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              {newVariationForm.images && newVariationForm.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                  {newVariationForm.images.map((url, i) => (
                    <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} className="w-full h-full object-cover" alt={`Imagem ${i + 1}`} />
                      <button
                        onClick={() => {
                          setNewVariationForm({
                            ...newVariationForm,
                            images: newVariationForm.images?.filter((_, idx) => idx !== i) || []
                          });
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex gap-4">
            <Button 
              className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm px-6 h-11"
              onClick={() => {
                setShowVariationForm(false);
                setNewVariationForm({
                  size: '',
                  color: '',
                  stock_quantity: 0,
                  images: [],
                  sku: ''
                });
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-gray-900 text-white h-11 rounded-lg hover:bg-orange-500 text-sm font-medium"
              onClick={handleAddVariation}
              disabled={!newVariationForm.size || !newVariationForm.color}
            >
              Adicionar Variação
            </Button>
          </div>
        </div>
      )}

      {/* Edit Variation Form Modal */}
      {showEditVariationForm && editingVariation && (
        <div className="bg-white border border-gray-200 mb-16 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-6">
            <h2 className="text-2xl font-serif italic text-white">Editar Variação</h2>
            <p className="text-[10px] text-gray-200 uppercase tracking-[0.2em] mt-1">Modifique tamanho, cor e estoque</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Tamanho *</Label>
                <select 
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={editingVariation.size}
                  onChange={e => setEditingVariation({...editingVariation, size: e.target.value})}
                >
                  <option value="">Selecione o tamanho</option>
                  {SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Cor *</Label>
                <select 
                  className="w-full bg-white text-gray-900 border border-gray-300 p-3 h-12 text-sm rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={editingVariation.color}
                  onChange={e => setEditingVariation({...editingVariation, color: e.target.value})}
                >
                  <option value="">Selecione a cor</option>
                  {COLOR_OPTIONS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Estoque *</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  className="bg-white border-gray-300 rounded-lg h-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  value={editingVariation.stock_quantity}
                  onChange={e => setEditingVariation({...editingVariation, stock_quantity: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Images for Variation */}
            <div className="space-y-4">
              <Label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Fotos da Variação (Opcional)</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="Cole a URL da imagem aqui"
                  className="bg-white border-gray-300 rounded-lg h-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm flex-1"
                  value={imageInput}
                  onChange={e => setImageInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (() => {
                    if (imageInput) {
                      setEditingVariation({
                        ...editingVariation,
                        images: [...(editingVariation.images || []), imageInput]
                      });
                      setImageInput('');
                    }
                  })()}
                />
                <Button
                  onClick={() => {
                    if (imageInput) {
                      setEditingVariation({
                        ...editingVariation,
                        images: [...(editingVariation.images || []), imageInput]
                      });
                      setImageInput('');
                    }
                  }}
                  className="h-12 px-6 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              {editingVariation.images && editingVariation.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                  {editingVariation.images.map((url, i) => (
                    <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} className="w-full h-full object-cover" alt={`Imagem ${i + 1}`} />
                      <button
                        onClick={() => {
                          setEditingVariation({
                            ...editingVariation,
                            images: editingVariation.images?.filter((_, idx) => idx !== i) || []
                          });
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex gap-4">
            <Button 
              className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm px-6 h-11"
              onClick={() => {
                setShowEditVariationForm(false);
                setEditingVariation(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-blue-600 text-white h-11 rounded-lg hover:bg-blue-700 text-sm font-medium"
              onClick={handleEditVariation}
              disabled={!editingVariation.size || !editingVariation.color}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {/* Main Inventory Controller List */}
      <div>
        <div className="mb-8">
          <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-1">Database Sync Register</p>
          <h2 className="text-2xl font-serif italic text-gray-900">Catálogo de <span className="text-orange-500 underline underline-offset-4 decoration-gray-200">Estoque</span></h2>
        </div>

        <div className="bg-gray-50 border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-mono">
              <tr>
                <th className="px-8 py-5">Item do Sistema</th>
                <th className="px-8 py-5">Classificação / SKU</th>
                <th className="px-8 py-5">Valoração (Unit.)</th>
                <th className="px-8 py-5 text-center">Peças</th>
                <th className="px-8 py-5 text-right">Métricas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[11px] tracking-widest font-medium">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-100 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-200 overflow-hidden border border-gray-300">
                        <img src={(product.images && product.images.length > 0) ? product.images[0] : product.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 uppercase group-hover:text-orange-500 transition-colors">{product.name}</span>
                        <span className="text-[8px] font-mono opacity-30">ID: {product.id.slice(0,10).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-500">{product.category}</span>
                      <span className="text-[8px] font-mono text-gray-400 mt-1">{product.sku || 'NÃO CONFIGURADO'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-700">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`font-mono text-sm ${(product.stock || 0) < 5 ? 'text-orange-500 font-bold' : 'text-gray-600'}`}>{(product.stock || 0).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingProduct({
                            ...product,
                            originalPrice: (product as any).compare_at_price
                          });
                          setShowEditForm(true);
                          setShowAddForm(false);
                        }}
                        className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          await ProductService.deleteProduct(product.id);
                          await refreshProducts();
                        }}
                        className="p-2 hover:bg-orange-500/20 text-orange-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Transactions Balance / Registros de Pedidos */}
      <div className="mt-16">
        <div className="mb-8">
          <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-1">Consolidated Operational Register</p>
          <h2 className="text-2xl font-serif italic text-gray-900">Conselho de <span className="text-orange-500 underline underline-offset-4 decoration-gray-200">Vendas & Pedidos</span></h2>
        </div>

        {orders.length === 0 ? (
          <div className="border border-gray-200 bg-gray-50 p-16 text-center text-gray-400 text-[10px] uppercase tracking-[0.2em] font-mono">
            Nenhuma venda registrada no banco de dados.
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                <tr>
                  <th className="px-8 py-5">Código Venda</th>
                  <th className="px-8 py-5">Cliente</th>
                  <th className="px-8 py-5">Produtos / Grade</th>
                  <th className="px-8 py-5">Local Logístico Map</th>
                  <th className="px-8 py-5 text-right">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px] tracking-widest font-mono">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100 transition-colors leading-relaxed">
                    <td className="px-8 py-5 font-bold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-8 py-5 font-sans">
                      <div className="flex flex-col">
                        <span className="text-gray-900 text-xs font-semibold uppercase">{order.customerName}</span>
                        <span className="text-[10px] opacity-40 lowercase font-mono">{order.userEmail}</span>
                        <span className="text-[9px] opacity-40 font-mono">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-sans">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-700">
                          {item.quantity}x {item.name} <span className="text-[10px] text-orange-500 font-mono">({item.size} / {item.color})</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-8 py-5 font-sans text-gray-500 text-xs">
                      {order.address}
                    </td>
                    <td className="px-8 py-5 text-right text-green-600 font-bold">
                      R$ {order.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
