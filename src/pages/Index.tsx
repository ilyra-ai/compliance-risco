import { useState } from "react";
import { ComplianceHeader } from "@/components/ComplianceHeader";
import { DocumentInput } from "@/components/DocumentInput";
import { ComplianceModules, defaultModules } from "@/components/ComplianceModules";
import { ComplianceReport } from "@/components/ComplianceReport";
import { complianceService } from "@/services/complianceService";
import { useToast } from "@/components/ui/use-toast";

interface ModuleStatus {
  id: string;
  name: string;
  icon: any;
  status: 'completed' | 'processing' | 'pending' | 'error';
  progress: number;
  result?: {
    score: number;
    risk: 'low' | 'medium' | 'high';
    findings: number;
    details: string[];
  };
}

const Index = () => {
  const [currentDocument, setCurrentDocument] = useState<string>("");
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cnpj');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (document: string, type: 'cpf' | 'cnpj') => {
    setCurrentDocument(document);
    setDocumentType(type);
    setIsAnalyzing(true);
    setShowReport(false);
    setAnalysisResult(null);

    // Initialize modules
    const initialModules = defaultModules.map(m => ({
      ...m,
      status: 'pending' as const,
      progress: 0,
      result: undefined
    }));
    setModules(initialModules);

    try {
      // Simulate real-time progress
      const progressGenerator = complianceService.analyzeDocumentWithProgress(document, type);
      
      for await (const update of progressGenerator) {
        if (update.isComplete && update.result) {
          setAnalysisResult(update.result);
          setShowReport(true);
          toast({
            title: "Análise Concluída",
            description: "Relatório de compliance gerado com sucesso.",
          });
        } else {
          // Convert modules to expected format
          const updatedModules = update.modules.map(m => ({
            id: m.id,
            name: m.name,
            icon: m.icon,
            status: m.status,
            progress: m.progress,
            result: m.result ? {
              score: m.result.score,
              risk: m.result.risk,
              findings: m.result.findings.length,
              details: m.result.findings
            } : undefined
          }));
          setModules(updatedModules);
        }
      }
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro durante a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewDetails = (moduleId: string) => {
    toast({
      title: "Detalhes do Módulo",
      description: `Visualizando detalhes completos do módulo ${moduleId}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ComplianceHeader />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {!showReport ? (
          <>
            <DocumentInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            
            {modules.length > 0 && (
              <ComplianceModules 
                modules={modules} 
                onViewDetails={handleViewDetails}
              />
            )}
          </>
        ) : (
          <ComplianceReport 
            document={currentDocument}
            documentType={documentType}
            analysisData={analysisResult}
          />
        )}
        
        {showReport && (
          <div className="text-center">
            <button
              onClick={() => {
                setShowReport(false);
                setModules([]);
                setAnalysisResult(null);
              }}
              className="text-primary hover:underline"
            >
              ← Voltar para Nova Análise
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;