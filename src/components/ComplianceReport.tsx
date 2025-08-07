import { useState } from "react";
import { 
  FileText, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ReportGenerator } from "@/utils/reportGenerator";

interface ComplianceReportProps {
  document: string;
  documentType: 'cpf' | 'cnpj';
  analysisData: any;
}

export const ComplianceReport = ({ document, documentType, analysisData }: ComplianceReportProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
  const { toast } = useToast();

  const overallScore = analysisData?.overallScore || 75;
  const riskLevel = analysisData?.riskLevel || 'medium';
  const totalFindings = analysisData?.totalFindings || 12;
  const criticalIssues = analysisData?.criticalIssues || 2;

  const handleDownloadPDF = () => {
    toast({
      title: "Gerando Relatório PDF",
      description: "Seu relatório completo será baixado em instantes.",
    });
    
    try {
      ReportGenerator.downloadPDF(analysisData);
      
      setTimeout(() => {
        toast({
          title: "Download Concluído",
          description: "Relatório PDF gerado com sucesso.",
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadJSON = () => {
    try {
      ReportGenerator.downloadJSON(analysisData, {
        includeRawData: true,
        includeSources: true,
        includeTimestamps: true,
        lgpdCompliant: true
      });

      toast({
        title: "Download Concluído",
        description: "Dados da análise exportados em formato JSON.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar JSON",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-success bg-success/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'high':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'high':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-success" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header do Relatório */}
      <Card className="shadow-large border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>Relatório de Compliance</span>
              </CardTitle>
              <p className="text-primary-foreground/80 mt-1">
                {documentType === 'cpf' ? 'Pessoa Física' : 'Pessoa Jurídica'}: {document}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleDownloadPDF}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleDownloadJSON}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{overallScore}</div>
              <div className="text-sm text-muted-foreground">Score Geral</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getRiskIcon(riskLevel)}
              </div>
              <Badge className={getRiskColor(riskLevel)}>
                {riskLevel === 'low' ? 'Baixo Risco' : 
                 riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Nível de Risco</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-1">{totalFindings}</div>
              <div className="text-sm text-muted-foreground">Total de Achados</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive mb-1">{criticalIssues}</div>
              <div className="text-sm text-muted-foreground">Questões Críticas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'summary' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('summary')}
        >
          Resumo Executivo
        </Button>
        <Button
          variant={activeTab === 'detailed' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('detailed')}
        >
          Análise Detalhada
        </Button>
      </div>

      {/* Conteúdo do Relatório */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Resumo por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Validação Cadastral', score: 95, risk: 'low', trend: 'stable' },
                { name: 'Sanções e Restrições', score: 85, risk: 'low', trend: 'down' },
                { name: 'Situação Fiscal', score: 70, risk: 'medium', trend: 'up' },
                { name: 'Processos Judiciais', score: 60, risk: 'medium', trend: 'up' },
                { name: 'Conformidade Ambiental', score: 45, risk: 'high', trend: 'up' }
              ].map((category, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(category.trend)}
                        <span className="text-sm font-bold">{category.score}</span>
                      </div>
                    </div>
                    <Progress value={category.score} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Principais Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Principais Alertas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  type: 'high',
                  title: 'Multa Ambiental Pendente',
                  description: 'IBAMA - R$ 250.000 em aberto desde 2023',
                  source: 'IBAMA'
                },
                {
                  type: 'medium',
                  title: 'Processo Trabalhista',
                  description: '3 processos ativos no TST',
                  source: 'Tribunal Superior do Trabalho'
                },
                {
                  type: 'medium',
                  title: 'Débitos Fiscais',
                  description: 'ICMS em atraso - SP',
                  source: 'Receita Estadual'
                },
                {
                  type: 'low',
                  title: 'Alteração Contratual',
                  description: 'Mudança de endereço não registrada',
                  source: 'JUCESP'
                }
              ].map((alert, idx) => (
                <div key={idx} className="border-l-4 border-l-warning pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-primary mt-1">Fonte: {alert.source}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        alert.type === 'high' ? 'border-destructive text-destructive' :
                        alert.type === 'medium' ? 'border-warning text-warning' :
                        'border-muted-foreground text-muted-foreground'
                      }
                    >
                      {alert.type === 'high' ? 'Alto' : 
                       alert.type === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisData?.modules?.map((module: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <Badge className={getRiskColor(module.risk)}>
                      Score: {module.score}/100
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Achados Principais:</h4>
                      <ul className="text-sm space-y-1">
                        {module.findings?.map((finding: string, findingIdx: number) => (
                          <li key={findingIdx} className="text-muted-foreground">
                            • {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Fontes Consultadas:</h4>
                      <ul className="text-sm space-y-1">
                        {module.sources?.map((source: string, sourceIdx: number) => (
                          <li key={sourceIdx} className="text-primary">
                            • {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Dados detalhados serão exibidos após a conclusão da análise.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer do Relatório */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Gerado em: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
            <p>Lyra Compliance AI v1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};