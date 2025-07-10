import type { Document, ConversationStep } from '../types';

export const documents: Document[] = [
  {
    id: 'financial-compliance',
    title: 'Financial Compliance',
    description: 'Learn about financial regulations and compliance requirements',
    content: 'This document covers essential financial compliance topics including AML, KYC, and regulatory reporting.',
    keywords: ['compliance', 'regulation', 'AML', 'KYC', 'reporting', 'audit', 'risk', 'policy', 'procedure', 'monitoring']
  },
  {
    id: 'volvo-history',
    title: 'Volvo History',
    description: 'Explore the history and heritage of Volvo',
    content: 'Learn about Volvo\'s journey from its founding in 1927 to becoming a global automotive leader.',
    keywords: ['safety', 'innovation', 'Swedish', 'engineering', 'quality', 'sustainability', 'design', 'heritage', 'technology', 'reliability']
  }
];

export const conversationSteps: Record<string, ConversationStep[]> = {
  'financial-compliance': [
    {
      id: 'fc-start',
      text: 'Welcome! I\'m here to help you understand financial compliance. What aspect would you like to explore?',
      options: [
        {
          id: 'fc-opt-1',
          text: 'Tell me about AML requirements',
          keywords: ['AML', 'compliance', 'regulation'],
          nextStepId: 'fc-aml'
        },
        {
          id: 'fc-opt-2',
          text: 'What are KYC procedures?',
          keywords: ['KYC', 'procedure', 'compliance'],
          nextStepId: 'fc-kyc'
        },
        {
          id: 'fc-opt-3',
          text: 'How do we handle regulatory reporting?',
          keywords: ['reporting', 'regulation', 'compliance'],
          nextStepId: 'fc-reporting'
        }
      ]
    },
    {
      id: 'fc-aml',
      text: 'AML (Anti-Money Laundering) involves monitoring transactions and implementing policies to prevent illegal activities. What specific area interests you?',
      options: [
        {
          id: 'fc-aml-1',
          text: 'Transaction monitoring processes',
          keywords: ['monitoring', 'AML', 'procedure'],
          nextStepId: 'fc-end'
        },
        {
          id: 'fc-aml-2',
          text: 'Risk assessment methods',
          keywords: ['risk', 'AML', 'audit'],
          nextStepId: 'fc-end'
        }
      ]
    },
    {
      id: 'fc-kyc',
      text: 'KYC (Know Your Customer) procedures help verify client identities and assess risks. Which aspect would you like to learn about?',
      options: [
        {
          id: 'fc-kyc-1',
          text: 'Customer verification steps',
          keywords: ['KYC', 'procedure', 'policy'],
          nextStepId: 'fc-end'
        },
        {
          id: 'fc-kyc-2',
          text: 'Documentation requirements',
          keywords: ['KYC', 'compliance', 'audit'],
          nextStepId: 'fc-end'
        }
      ]
    },
    {
      id: 'fc-reporting',
      text: 'Regulatory reporting ensures transparency and compliance with financial authorities. What would you like to know?',
      options: [
        {
          id: 'fc-rep-1',
          text: 'Reporting timelines and deadlines',
          keywords: ['reporting', 'regulation', 'compliance'],
          nextStepId: 'fc-end'
        },
        {
          id: 'fc-rep-2',
          text: 'Audit trail requirements',
          keywords: ['audit', 'reporting', 'policy'],
          nextStepId: 'fc-end'
        }
      ]
    },
    {
      id: 'fc-end',
      text: 'Great job! You\'ve demonstrated good understanding of financial compliance concepts. Keep exploring to earn more stars!',
      options: []
    }
  ],
  'volvo-history': [
    {
      id: 'vh-start',
      text: 'Hello! I\'m excited to share Volvo\'s rich history with you. What would you like to discover?',
      options: [
        {
          id: 'vh-opt-1',
          text: 'Tell me about Volvo\'s founding',
          keywords: ['Swedish', 'heritage', 'quality'],
          nextStepId: 'vh-founding'
        },
        {
          id: 'vh-opt-2',
          text: 'What makes Volvo known for safety?',
          keywords: ['safety', 'innovation', 'engineering'],
          nextStepId: 'vh-safety'
        },
        {
          id: 'vh-opt-3',
          text: 'How has Volvo embraced sustainability?',
          keywords: ['sustainability', 'technology', 'innovation'],
          nextStepId: 'vh-sustainability'
        }
      ]
    },
    {
      id: 'vh-founding',
      text: 'Volvo was founded in 1927 in Gothenburg, Sweden, with a focus on quality and reliability. What interests you most?',
      options: [
        {
          id: 'vh-found-1',
          text: 'The Swedish engineering philosophy',
          keywords: ['Swedish', 'engineering', 'design'],
          nextStepId: 'vh-end'
        },
        {
          id: 'vh-found-2',
          text: 'Early innovations and designs',
          keywords: ['innovation', 'design', 'heritage'],
          nextStepId: 'vh-end'
        }
      ]
    },
    {
      id: 'vh-safety',
      text: 'Volvo pioneered many safety innovations, including the three-point seatbelt in 1959. Which safety feature interests you?',
      options: [
        {
          id: 'vh-safety-1',
          text: 'Three-point seatbelt invention',
          keywords: ['safety', 'innovation', 'technology'],
          nextStepId: 'vh-end'
        },
        {
          id: 'vh-safety-2',
          text: 'Modern safety systems',
          keywords: ['safety', 'technology', 'reliability'],
          nextStepId: 'vh-end'
        }
      ]
    },
    {
      id: 'vh-sustainability',
      text: 'Volvo is committed to becoming fully electric by 2030. What aspect of their sustainability journey interests you?',
      options: [
        {
          id: 'vh-sus-1',
          text: 'Electric vehicle development',
          keywords: ['sustainability', 'technology', 'innovation'],
          nextStepId: 'vh-end'
        },
        {
          id: 'vh-sus-2',
          text: 'Environmental commitments',
          keywords: ['sustainability', 'quality', 'design'],
          nextStepId: 'vh-end'
        }
      ]
    },
    {
      id: 'vh-end',
      text: 'Excellent! You\'ve learned about Volvo\'s commitment to safety, quality, and innovation. Keep exploring to master all topics!',
      options: []
    }
  ]
};