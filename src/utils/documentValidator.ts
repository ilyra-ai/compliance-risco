/**
 * Validador de documentos CPF e CNPJ
 * Sistema completo de validação com algoritmos oficiais
 */

export interface DocumentValidation {
  isValid: boolean;
  document: string;
  type: 'cpf' | 'cnpj' | null;
  formatted: string;
  errors: string[];
}

export class DocumentValidator {
  
  /**
   * Valida e detecta automaticamente o tipo de documento
   */
  static validate(document: string): DocumentValidation {
    const cleanDoc = document.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
      return this.validateCPF(cleanDoc);
    } else if (cleanDoc.length === 14) {
      return this.validateCNPJ(cleanDoc);
    }
    
    return {
      isValid: false,
      document: cleanDoc,
      type: null,
      formatted: document,
      errors: ['Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)']
    };
  }

  /**
   * Validação oficial de CPF
   */
  static validateCPF(cpf: string): DocumentValidation {
    const cleanCPF = cpf.replace(/\D/g, '');
    const errors: string[] = [];

    // Verificações básicas
    if (cleanCPF.length !== 11) {
      errors.push('CPF deve ter exatamente 11 dígitos');
    }

    // Verifica sequências inválidas
    const invalidSequences = [
      '00000000000', '11111111111', '22222222222', '33333333333',
      '44444444444', '55555555555', '66666666666', '77777777777',
      '88888888888', '99999999999'
    ];

    if (invalidSequences.includes(cleanCPF)) {
      errors.push('CPF não pode ser uma sequência de números iguais');
    }

    // Validação dos dígitos verificadores
    if (errors.length === 0) {
      // Primeiro dígito verificador
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      let firstDigit = remainder >= 10 ? 0 : remainder;

      if (firstDigit !== parseInt(cleanCPF.charAt(9))) {
        errors.push('Primeiro dígito verificador inválido');
      }

      // Segundo dígito verificador
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      let secondDigit = remainder >= 10 ? 0 : remainder;

      if (secondDigit !== parseInt(cleanCPF.charAt(10))) {
        errors.push('Segundo dígito verificador inválido');
      }
    }

    return {
      isValid: errors.length === 0,
      document: cleanCPF,
      type: 'cpf',
      formatted: this.formatCPF(cleanCPF),
      errors
    };
  }

  /**
   * Validação oficial de CNPJ
   */
  static validateCNPJ(cnpj: string): DocumentValidation {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    const errors: string[] = [];

    // Verificações básicas
    if (cleanCNPJ.length !== 14) {
      errors.push('CNPJ deve ter exatamente 14 dígitos');
    }

    // Verifica sequências inválidas
    const invalidSequences = [
      '00000000000000', '11111111111111', '22222222222222',
      '33333333333333', '44444444444444', '55555555555555',
      '66666666666666', '77777777777777', '88888888888888',
      '99999999999999'
    ];

    if (invalidSequences.includes(cleanCNPJ)) {
      errors.push('CNPJ não pode ser uma sequência de números iguais');
    }

    // Validação dos dígitos verificadores
    if (errors.length === 0) {
      // Primeiro dígito verificador
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
      }
      let remainder = sum % 11;
      let firstDigit = remainder < 2 ? 0 : 11 - remainder;

      if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) {
        errors.push('Primeiro dígito verificador inválido');
      }

      // Segundo dígito verificador
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
      }
      remainder = sum % 11;
      let secondDigit = remainder < 2 ? 0 : 11 - remainder;

      if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) {
        errors.push('Segundo dígito verificador inválido');
      }
    }

    return {
      isValid: errors.length === 0,
      document: cleanCNPJ,
      type: 'cnpj',
      formatted: this.formatCNPJ(cleanCNPJ),
      errors
    };
  }

  /**
   * Formata CPF
   */
  static formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return cnpj;
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Remove máscara do documento
   */
  static clean(document: string): string {
    return document.replace(/\D/g, '');
  }

  /**
   * Formata automaticamente baseado no tipo
   */
  static autoFormat(document: string): string {
    const clean = this.clean(document);
    
    if (clean.length === 11) {
      return this.formatCPF(clean);
    } else if (clean.length === 14) {
      return this.formatCNPJ(clean);
    }
    
    return document;
  }

  /**
   * Gera exemplos válidos para teste
   */
  static getExamples(): { cpf: string; cnpj: string } {
    return {
      cpf: '11144477735', // CPF válido para teste
      cnpj: '33000167000101' // CNPJ Petrobras para teste
    };
  }

  /**
   * Máscaras CPF parcial para LGPD
   */
  static maskCPFForLGPD(cpf: string): string {
    const clean = this.clean(cpf);
    if (clean.length !== 11) return cpf;
    
    // Oculta os dígitos centrais: XXX.XXX.XXX-XX -> XXX.***.**-XX
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.**-$4');
  }

  /**
   * Máscara CNPJ parcial para LGPD (mantém apenas raiz)
   */
  static maskCNPJForLGPD(cnpj: string): string {
    const clean = this.clean(cnpj);
    if (clean.length !== 14) return cnpj;
    
    // Oculta filial e DV: XX.XXX.XXX/XXXX-XX -> XX.XXX.XXX/****-**
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/****-**');
  }
}

// Export default para facilitar importação
export default DocumentValidator;