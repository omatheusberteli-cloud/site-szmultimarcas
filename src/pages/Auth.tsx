import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { AuthService } from "../services/auth.service";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect parameter support (e.g. if arriving from admin)
  const from = location.state?.from?.pathname || "/";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!isLogin && !name) {
      setError("Por favor, preencha seu nome para o cadastro.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await AuthService.signIn({ email, password });
        if (error) throw error;
      } else {
        const { error } = await AuthService.signUp({ 
          email, 
          password, 
          fullName: name 
        });
        if (error) throw error;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Invalid login credentials")) {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else if (err.message?.includes("User already registered")) {
        setError("Este endereço de e-mail já está sendo utilizado.");
      } else if (err.message?.includes("Password should be at least")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(err.message || "Ocorreu um erro no acesso. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-[#050505]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#0A0A0A] border border-white/10 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500/20 via-orange-500 to-orange-500/20" />
        
        <div className="text-center mb-10">
          <p className="text-orange-500 text-[10px] tracking-[0.3em] uppercase mb-2 font-mono">SZ Security Access</p>
          <h2 className="text-3xl font-serif italic text-white uppercase tracking-wider">
            {isLogin ? "Acesso ao Sistema" : "Novo Cadastro"}
          </h2>
          <p className="text-white/40 text-xs mt-2 font-light">
            {isLogin 
              ? "Entre com suas credenciais" 
              : "Preencha os dados abaixo para criar sua conta exclusiva"}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-none"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="auth-name" className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Nome Completo</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                  <User className="w-4 h-4" />
                </span>
                <Input 
                  id="auth-name"
                  type="text"
                  placeholder="Seu nome"
                  className="bg-white/5 border-white/10 rounded-none h-12 pl-12 pr-4 focus:border-orange-500 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email" className="text-[10px] uppercase tracking-widest text-white/40 font-mono">E-mail</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                <Mail className="w-4 h-4" />
              </span>
              <Input 
                id="auth-email"
                type="email"
                placeholder="exemplo@szmultimarcas.com"
                className="bg-white/5 border-white/10 rounded-none h-12 pl-12 pr-4 focus:border-orange-500 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password" className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Senha</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                <Lock className="w-4 h-4" />
              </span>
              <Input 
                id="auth-password"
                type="password"
                placeholder="******"
                className="bg-white/5 border-white/10 rounded-none h-12 pl-12 pr-4 focus:border-orange-500 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black h-12 rounded-none hover:bg-orange-500 hover:text-white text-[10px] uppercase tracking-[0.25em] font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Acessando...</span>
            ) : (
              <>
                {isLogin ? "Entrar no Sistema" : "Finalizar Cadastro"}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs">
          <p className="text-white/40">
            {isLogin ? "Não possui uma conta?" : "Já possui um cadastro?"}{" "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-500 font-semibold hover:underline"
            >
              {isLogin ? "Criar Conta" : "Fazer Login"}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex gap-3 text-[9px] text-white/30 tracking-wider justify-center">
          <div className="flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500/80" />
            SECURE INTEGRITY
          </div>
          <span className="text-white/10">•</span>
          <div className="font-mono">SSL ACTIVE</div>
        </div>
      </motion.div>
    </div>
  );
}
