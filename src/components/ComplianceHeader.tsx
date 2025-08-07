import { Shield, FileSearch, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ComplianceHeader = () => {
  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-large">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lyra Compliance AI</h1>
              <p className="text-primary-foreground/80 text-lg">
                Sistema Inteligente de Due Diligence e Compliance
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Análises Realizadas</p>
              <p className="text-2xl font-bold">1.247</p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <FileSearch className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-primary-foreground/90">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm">15 Módulos Ativos</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-foreground/90">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Fontes Oficiais Verificadas</span>
          </div>
        </div>
      </div>
    </header>
  );
};