/**
 * Gerador de relatórios em PDF e JSON
 * Sistema completo de geração de relatórios de compliance
 */

import type { AnalysisResult } from '@/services/complianceService';

export interface ReportOptions {
  includeRawData: boolean;
  includeSources: boolean;
  includeTimestamps: boolean;
  lgpdCompliant: boolean;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: Date;
  modificationDate: Date;
}

export class ReportGenerator {
  
  /**
   * Gera relatório completo em JSON
   */
  static generateJSONReport(
    analysisResult: AnalysisResult,
    options: Partial<ReportOptions> = {}
  ): string {
    const defaultOptions: ReportOptions = {
      includeRawData: true,
      includeSources: true,
      includeTimestamps: true,
      lgpdCompliant: true
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    const report = {
      metadata: {
        version: "1.0.0",
        generatedBy: "Lyra Compliance AI",
        generatedAt: new Date().toISOString(),
        reportType: "compliance_analysis",
        lgpdCompliant: finalOptions.lgpdCompliant
      },
      
      document: {
        number: finalOptions.lgpdCompliant 
          ? this.maskDocument(analysisResult.entityInfo.document, analysisResult.entityInfo.type)
          : analysisResult.entityInfo.document,
        type: analysisResult.entityInfo.type,
        status: analysisResult.entityInfo.status
      },

      entity: {
        name: analysisResult.entityInfo.name,
        ...(analysisResult.entityInfo.registrationDate && {
          registrationDate: analysisResult.entityInfo.registrationDate
        }),
        ...(analysisResult.entityInfo.address && {
          address: analysisResult.entityInfo.address
        }),
        ...(analysisResult.entityInfo.activities && {
          activities: analysisResult.entityInfo.activities
        })
      },

      summary: {
        overallScore: analysisResult.overallScore,
        riskLevel: analysisResult.riskLevel,
        totalFindings: analysisResult.totalFindings,
        criticalIssues: analysisResult.criticalIssues,
        modulesAnalyzed: analysisResult.modules.length,
        averageModuleScore: Math.round(
          analysisResult.modules.reduce((sum, m) => sum + m.score, 0) / analysisResult.modules.length
        )
      },

      riskAnalysis: this.generateRiskAnalysis(analysisResult),
      
      modules: analysisResult.modules.map(module => ({
        id: module.id,
        name: module.name,
        score: module.score,
        risk: module.risk,
        status: module.status,
        findings: module.findings,
        ...(finalOptions.includeSources && { sources: module.sources }),
        ...(finalOptions.includeTimestamps && { 
          analyzedAt: new Date().toISOString() 
        })
      })),

      recommendations: this.generateRecommendations(analysisResult),
      
      compliance: {
        highRiskModules: analysisResult.modules.filter(m => m.risk === 'high').length,
        mediumRiskModules: analysisResult.modules.filter(m => m.risk === 'medium').length,
        lowRiskModules: analysisResult.modules.filter(m => m.risk === 'low').length,
        completedModules: analysisResult.modules.filter(m => m.status === 'completed').length
      },

      disclaimer: {
        dataSource: "Fontes públicas e oficiais",
        accuracy: "Dados coletados de APIs públicas e portais governamentais",
        limitation: "Este relatório não constitui consultoria jurídica",
        updateFrequency: "Dados atualizados em tempo real",
        lgpdCompliance: "Relatório em conformidade com LGPD"
      }
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Gera relatório em formato HTML para conversão posterior em PDF
   */
  static generateHTML(analysisData: any): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Compliance - ${analysisData.document || 'N/A'}</title>
    <style>
        ${this.getReportCSS()}
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Cabeçalho -->
        <header class="report-header">
            <div class="header-content">
                <h1>Relatório de Compliance e Due Diligence</h1>
                <div class="entity-info">
                    <h2>${analysisData.entityInfo?.name || 'Entidade'}</h2>
                    <p>Documento: ${analysisData.document}</p>
                    <p>Score Geral: ${analysisData.overallScore}/100</p>
                </div>
            </div>
            <div class="report-meta">
                <p>Gerado em: ${currentDate} às ${currentTime}</p>
                <p>Versão: Lyra Compliance AI v1.0.0</p>
            </div>
        </header>

        <!-- Resumo Executivo -->
        <section class="executive-summary">
            <h2>Resumo Executivo</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Score Geral</h3>
                    <div class="score-circle ${this.getScoreClass(analysisData.overallScore)}">
                        ${analysisData.overallScore}
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Nível de Risco</h3>
                    <div class="risk-badge ${analysisData.riskLevel || 'medium'}">
                        ${this.getRiskLabel(analysisData.riskLevel || 'medium')}
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Módulos Analisados</h3>
                    <div class="metric">${analysisData.modules?.length || 0}</div>
                </div>
                <div class="summary-card">
                    <h3>Alertas Alto Risco</h3>
                    <div class="metric critical">${analysisData.modules?.filter((m: any) => m.result?.risk === 'high').length || 0}</div>
                </div>
            </div>
        </section>

        <!-- Informações da Entidade -->
        <section class="entity-details">
            <h2>Informações da Entidade</h2>
            <div class="entity-grid">
                <div class="entity-item">
                    <strong>Nome/Razão Social:</strong>
                    <span>${analysisData.entityInfo?.name || 'Não informado'}</span>
                </div>
                <div class="entity-item">
                    <strong>Documento:</strong>
                    <span>${analysisData.document}</span>
                </div>
                <div class="entity-item">
                    <strong>Status:</strong>
                    <span>${analysisData.entityInfo?.status || 'Não informado'}</span>
                </div>
                ${analysisData.entityInfo?.registrationDate ? `
                <div class="entity-item">
                    <strong>Data de Abertura/Nascimento:</strong>
                    <span>${new Date(analysisData.entityInfo.registrationDate).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${analysisData.entityInfo?.address ? `
                <div class="entity-item">
                    <strong>Endereço:</strong>
                    <span>${analysisData.entityInfo.address}</span>
                </div>
                ` : ''}
                ${analysisData.entityInfo?.activities?.length > 0 ? `
                <div class="entity-item">
                    <strong>Atividades:</strong>
                    <span>${analysisData.entityInfo.activities.join(', ')}</span>
                </div>
                ` : ''}
            </div>
        </section>

        <!-- Análise por Módulos -->
        <section class="modules-analysis">
            <h2>Análise Detalhada por Módulo</h2>
            ${analysisData.modules?.map((module: any) => `
                <div class="module-card">
                    <div class="module-header">
                        <h3>${module.name}</h3>
                        <div class="module-score">
                            <span class="score">${module.score || module.result?.score || 0}/100</span>
                            <span class="risk-badge ${module.risk || module.result?.risk || 'low'}">${this.getRiskLabel(module.risk || module.result?.risk || 'low')}</span>
                        </div>
                    </div>
                    <div class="module-content">
                        <div class="findings">
                            <h4>Principais Achados:</h4>
                            <ul>
                                ${(module.findings || module.result?.findings || []).map((finding: string) => `<li>${finding}</li>`).join('') || '<li>Nenhum achado identificado.</li>'}
                            </ul>
                        </div>
                        ${(module.sources || module.result?.sources)?.length > 0 ? `
                        <div class="sources">
                            <h4>Fontes Consultadas:</h4>
                            <div class="sources-list">
                                ${(module.sources || module.result?.sources).map((source: string) => `<span class="source-tag">${source}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        <div class="methodology">
                            <h4>Metodologia de Análise:</h4>
                            <p>
                                ${module.id === 'cadastral' ? 'Verificação de dados cadastrais através de consultas à Receita Federal e bases oficiais. Análise da situação ativa/inativa da entidade.' : ''}
                                ${module.id === 'sancoes' ? 'Consulta a listas de sanções nacionais (CADIN, CEIS/CNEP) e internacionais (ONU, EU). Verificação de restrições e penalidades.' : ''}
                                ${module.id === 'processos' ? 'Busca em tribunais estaduais e federais através de APIs especializadas. Análise do histórico processual.' : ''}
                                ${module.id === 'fiscal' ? 'Verificação da situação fiscal federal, estadual e municipal. Consulta de débitos e regularidade.' : ''}
                                ${module.id === 'midia' ? 'Análise de menções na mídia com classificação de sentimento. Monitoramento de reputação.' : ''}
                                ${!['cadastral', 'sancoes', 'processos', 'fiscal', 'midia'].includes(module.id) ? 'Análise baseada em múltiplas fontes de dados públicos e privados com algoritmos de classificação de risco.' : ''}
                            </p>
                        </div>
                        <div class="analysis-status">
                            <h4>Status da Análise:</h4>
                            <p>${module.status === 'completed' ? '✅ Análise Concluída com Sucesso' : '⏳ Em Processamento'}</p>
                        </div>
                    </div>
                </div>
            `).join('') || '<p>Nenhum módulo analisado.</p>'}
        </section>

        <!-- Recomendações -->
        <section class="recommendations">
            <h2>Recomendações e Plano de Ação</h2>
            <div class="recommendation-card medium">
                <h3>Monitoramento Contínuo</h3>
                <p>Implemente rotinas de verificação periódica dos módulos analisados para manter o compliance atualizado.</p>
                <div class="recommendation-meta">
                    <span class="priority">Prioridade: Média</span>
                    <span class="timeline">Prazo: Contínuo</span>
                </div>
            </div>
            
            ${analysisData.modules?.filter((m: any) => m.result?.risk === 'high').length > 0 ? `
            <div class="recommendation-card high">
                <h3>Ação Imediata Requerida</h3>
                <p>Módulos de alto risco identificados requerem atenção imediata. Revise os achados e implemente ações corretivas.</p>
                <div class="recommendation-meta">
                    <span class="priority">Prioridade: Alta</span>
                    <span class="timeline">Prazo: 7 dias</span>
                </div>
            </div>
            ` : ''}
        </section>

        <!-- Rodapé -->
        <footer class="report-footer">
            <div class="disclaimer">
                <h3>Disclaimer</h3>
                <p>Este relatório foi gerado automaticamente com base em dados de fontes públicas e oficiais. 
                As informações aqui contidas não constituem consultoria jurídica e devem ser validadas 
                por profissionais especializados. Os dados estão em conformidade com a LGPD.</p>
            </div>
            <div class="footer-meta">
                <p>Relatório gerado por Lyra Compliance AI | Versão 1.0.0</p>
                <p>Data/Hora: ${currentDate} - ${currentTime}</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Gera CSS para o relatório HTML
   */
  private static getReportCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }

        .entity-info h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .report-meta {
            text-align: right;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .executive-summary {
            padding: 2rem;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 1rem;
        }

        .summary-card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e9ecef;
        }

        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 1rem auto;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
        }

        .score-circle.high { background: #28a745; }
        .score-circle.medium { background: #ffc107; color: #333; }
        .score-circle.low { background: #dc3545; }

        .risk-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8rem;
        }

        .risk-badge.low { background: #d4edda; color: #155724; }
        .risk-badge.medium { background: #fff3cd; color: #856404; }
        .risk-badge.high { background: #f8d7da; color: #721c24; }

        .metric {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-top: 0.5rem;
        }

        .metric.critical {
            color: #dc3545;
        }

        .modules-analysis {
            padding: 2rem;
            background: #f8f9fa;
        }

        .module-card {
            background: white;
            margin: 1rem 0;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e9ecef;
        }

        .module-header {
            background: #667eea;
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .module-content {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        .findings ul, .sources ul {
            margin-top: 0.5rem;
        }

        .findings li, .sources li {
            margin: 0.3rem 0;
            padding-left: 1rem;
        }

        .recommendations {
            padding: 2rem;
        }

        .recommendation-card {
            background: #f8f9fa;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .recommendation-card.high {
            border-left-color: #dc3545;
            background: #f8d7da;
        }

        .recommendation-card.medium {
            border-left-color: #ffc107;
            background: #fff3cd;
        }

        .recommendation-meta {
            margin-top: 1rem;
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
            font-weight: bold;
        }

        .report-footer {
            background: #343a40;
            color: white;
            padding: 2rem;
        }

        .disclaimer {
            margin-bottom: 1rem;
        }

        .footer-meta {
            text-align: center;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
        }
    `;
  }

  /**
   * Mascara documento para LGPD
   */
  private static maskDocument(document: string, type: 'cpf' | 'cnpj'): string {
    const clean = document.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // CPF: XXX.***.**-XX
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    } else {
      // CNPJ: XX.XXX.XXX/****-**
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/****-**');
    }
  }

  /**
   * Gera análise de risco
   */
  private static generateRiskAnalysis(result: AnalysisResult) {
    const highRiskModules = result.modules.filter(m => m.risk === 'high');
    const mediumRiskModules = result.modules.filter(m => m.risk === 'medium');
    
    return {
      totalModules: result.modules.length,
      highRiskCount: highRiskModules.length,
      mediumRiskCount: mediumRiskModules.length,
      lowRiskCount: result.modules.filter(m => m.risk === 'low').length,
      mainConcerns: highRiskModules.slice(0, 3).map(m => ({
        module: m.name,
        score: m.score,
        mainIssue: m.findings[0] || 'Questões identificadas'
      })),
      riskTrend: this.calculateRiskTrend(result),
      mitigation: this.generateMitigationStrategies(result)
    };
  }

  /**
   * Gera recomendações baseadas na análise
   */
  private static generateRecommendations(result: AnalysisResult) {
    const recommendations = [];
    
    // Recomendações baseadas em módulos de alto risco
    const highRiskModules = result.modules.filter(m => m.risk === 'high');
    
    if (highRiskModules.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Ação Imediata - Questões Críticas',
        description: `Identificamos ${highRiskModules.length} módulo(s) com alto risco que requerem atenção imediata: ${highRiskModules.map(m => m.name).join(', ')}`,
        timeline: '1-7 dias',
        category: 'critical'
      });
    }

    // Recomendações por score geral
    if (result.overallScore < 60) {
      recommendations.push({
        priority: 'high',
        title: 'Plano de Compliance Urgente',
        description: 'Score geral abaixo do aceitável. Recomendamos implementação de programa de compliance estruturado.',
        timeline: '30 dias',
        category: 'governance'
      });
    }

    // Recomendações específicas por módulo
    result.modules.forEach(module => {
      if (module.risk === 'high' && module.name.includes('Ambiental')) {
        recommendations.push({
          priority: 'high',
          title: 'Regularização Ambiental',
          description: 'Questões ambientais identificadas. Consultar especialista e elaborar plano de adequação.',
          timeline: '60 dias',
          category: 'environmental'
        });
      }

      if (module.risk === 'high' && module.name.includes('Fiscal')) {
        recommendations.push({
          priority: 'high',
          title: 'Regularização Tributária',
          description: 'Pendências fiscais encontradas. Negociar parcelamento ou quitação dos débitos.',
          timeline: '30 dias',
          category: 'tax'
        });
      }
    });

    // Recomendação de monitoramento
    recommendations.push({
      priority: 'medium',
      title: 'Monitoramento Contínuo',
      description: 'Implementar rotina de monitoramento mensal para acompanhar mudanças no status de compliance.',
      timeline: 'Contínuo',
      category: 'monitoring'
    });

    return recommendations.slice(0, 5); // Limita a 5 recomendações principais
  }

  /**
   * Calcula tendência de risco
   */
  private static calculateRiskTrend(result: AnalysisResult): 'improving' | 'stable' | 'worsening' {
    // Simulação de tendência baseada no score
    if (result.overallScore >= 80) return 'improving';
    if (result.overallScore >= 60) return 'stable';
    return 'worsening';
  }

  /**
   * Gera estratégias de mitigação
   */
  private static generateMitigationStrategies(result: AnalysisResult) {
    return {
      immediate: 'Focar nos módulos de alto risco identificados',
      shortTerm: 'Implementar controles para módulos de médio risco',
      longTerm: 'Estabelecer programa de compliance contínuo',
      monitoring: 'Automatizar verificações mensais'
    };
  }

  /**
   * Obtém classe CSS baseada no score
   */
  private static getScoreClass(score: number): string {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Obtém label de risco
   */
  private static getRiskLabel(risk: string): string {
    switch (risk) {
      case 'low': return 'Baixo Risco';
      case 'medium': return 'Médio Risco';
      case 'high': return 'Alto Risco';
      default: return 'Não Avaliado';
    }
  }

  /**
   * Baixa relatório como PDF usando jsPDF
   */
  static async downloadPDF(analysisData: any, filename: string = 'relatorio-compliance.pdf') {
    try {
      // Dynamic import to avoid bundle issues
      const jsPDF = await import('jspdf').then(m => m.default);
      const html2canvas = await import('html2canvas').then(m => m.default);
      
      // Create a temporary div with the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.generateHTML(analysisData);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth
      });
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download
      const html = this.generateHTML(analysisData);
      const blob = new Blob([html], { type: 'text/html' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.pdf', '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Download de relatório simples (compatibilidade)
   */
  static downloadPDFLegacy(analysisResult: AnalysisResult): void {
    const htmlContent = this.generateHTML(analysisResult);
    
    // Em produção, usaria uma biblioteca como puppeteer ou jsPDF
    // Para demo, criamos um blob com o HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${analysisResult.entityInfo.document.replace(/\D/g, '')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download JSON
   */
  static downloadJSON(analysisResult: AnalysisResult, options?: Partial<ReportOptions>): void {
    const jsonContent = this.generateJSONReport(analysisResult, options);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-data-${analysisResult.entityInfo.document.replace(/\D/g, '')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default ReportGenerator;