import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Gavel, 
  Receipt, 
  HardHat, 
  Building, 
  Leaf, 
  Newspaper, 
  Lock, 
  Calculator, 
  DollarSign, 
  Truck, 
  Globe, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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

interface ComplianceModulesProps {
  modules: ModuleStatus[];
  onViewDetails: (moduleId: string) => void;
}

export const ComplianceModules = ({ modules, onViewDetails }: ComplianceModulesProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-warning animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Baixo Risco';
      case 'medium':
        return 'Médio Risco';
      case 'high':
        return 'Alto Risco';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Módulos de Análise</h2>
        <p className="text-muted-foreground">
          Análise completa em 15 módulos de compliance e due diligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <Card key={module.id} className="hover:shadow-medium transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                    </div>
                  </div>
                  {getStatusIcon(module.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>

                {module.result && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score de Compliance</span>
                      <span className="text-lg font-bold text-primary">
                        {module.result.score}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nível de Risco</span>
                      <Badge className={getRiskColor(module.result.risk)}>
                        {getRiskText(module.result.risk)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{module.result.findings}</span> ocorrências encontradas
                    </div>

                    {module.result.details.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">Principais Achados:</p>
                        <ul className="text-xs space-y-1">
                          {module.result.details.slice(0, 2).map((detail, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {detail}
                            </li>
                          ))}
                          {module.result.details.length > 2 && (
                            <li className="text-primary text-xs">
                              +{module.result.details.length - 2} mais...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onViewDetails(module.id)}
                  disabled={module.status === 'pending'}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Configuração padrão dos módulos
export const defaultModules: Omit<ModuleStatus, 'result' | 'progress' | 'status'>[] = [
  {
    id: 'cadastral',
    name: 'Validação Cadastral',
    icon: Shield
  },
  {
    id: 'societario',
    name: 'Quadro Societário',
    icon: Users
  },
  {
    id: 'sancoes',
    name: 'Sanções Nacionais/Internacionais',
    icon: AlertTriangle
  },
  {
    id: 'processos',
    name: 'Processos Judiciais',
    icon: Gavel
  },
  {
    id: 'fiscal',
    name: 'Situação Fiscal',
    icon: Receipt
  },
  {
    id: 'trabalhista',
    name: 'Relações Trabalhistas',
    icon: HardHat
  },
  {
    id: 'publico',
    name: 'Relação Setor Público',
    icon: Building
  },
  {
    id: 'ambiental',
    name: 'Conformidade Ambiental',
    icon: Leaf
  },
  {
    id: 'midia',
    name: 'Análise Reputacional',
    icon: Newspaper
  },
  {
    id: 'lgpd',
    name: 'Compliance LGPD',
    icon: Lock
  },
  {
    id: 'contabil',
    name: 'Conformidade Contábil',
    icon: Calculator
  },
  {
    id: 'lavagem',
    name: 'Risco Lavagem Dinheiro',
    icon: DollarSign
  },
  {
    id: 'fornecedores',
    name: 'Fornecedores e Terceiros',
    icon: Truck
  },
  {
    id: 'portais',
    name: 'Portais Oficiais',
    icon: Globe
  },
  {
    id: 'capacidade',
    name: 'Capacidade Operacional',
    icon: BarChart3
  }
];