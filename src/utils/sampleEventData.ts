import type { GraphData } from '@/types';

/**
 * Generate sample legal document data with timeline events for demonstration
 * This simulates what a real legal document processing would return
 */
export function generateSampleLegalData(): GraphData {
  return {
    nodes: [
      // Regular nodes
      {
        id: 'contract-001',
        label: 'Service Agreement',
        level: 0,
        type: 'document'
      },
      {
        id: 'party-a',
        label: 'TechCorp Inc.',
        level: 1,
        type: 'entity'
      },
      {
        id: 'party-b',
        label: 'Legal Services LLC',
        level: 1,
        type: 'entity'
      },
      
      // Event nodes with dates - these will appear on the timeline
      {
        id: 'event-signing',
        label: 'Contract Signing',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-01-15T09:00:00.000Z',
          details: 'Initial signing of the service agreement',
          location: 'TechCorp Headquarters'
        }
      },
      {
        id: 'event-effective',
        label: 'Effective Date',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-02-01T00:00:00.000Z',
          details: 'Contract becomes legally binding',
          location: 'Both Parties'
        }
      },
      {
        id: 'event-milestone-1',
        label: 'First Milestone Due',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-03-15T17:00:00.000Z',
          details: 'Delivery of initial legal consultation report',
          location: 'Digital Delivery'
        }
      },
      {
        id: 'event-payment-1',
        label: 'First Payment Due',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-03-30T23:59:00.000Z',
          details: 'Payment of $50,000 for initial services',
          location: 'Wire Transfer'
        }
      },
      {
        id: 'event-review',
        label: 'Quarterly Review',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-05-01T14:00:00.000Z',
          details: 'Quarterly performance and contract review meeting',
          location: 'Video Conference'
        }
      },
      {
        id: 'event-renewal',
        label: 'Contract Renewal Deadline',
        level: 2,
        type: 'event',
        properties: {
          date: '2024-12-31T23:59:00.000Z',
          details: 'Deadline for contract renewal decision',
          location: 'Both Parties'
        }
      },

      // More regular nodes
      {
        id: 'term-payment',
        label: 'Payment Terms',
        level: 3,
        type: 'clause'
      },
      {
        id: 'term-confidentiality',
        label: 'Confidentiality Clause',
        level: 3,
        type: 'clause'
      },
      {
        id: 'liability-limit',
        label: 'Liability Limitation',
        level: 3,
        type: 'clause'
      }
    ],
    edges: [
      // Connect parties to contract
      { source: 'contract-001', target: 'party-a' },
      { source: 'contract-001', target: 'party-b' },
      
      // Connect events to contract
      { source: 'contract-001', target: 'event-signing' },
      { source: 'contract-001', target: 'event-effective' },
      { source: 'contract-001', target: 'event-milestone-1' },
      { source: 'contract-001', target: 'event-payment-1' },
      { source: 'contract-001', target: 'event-review' },
      { source: 'contract-001', target: 'event-renewal' },
      
      // Connect terms to contract
      { source: 'contract-001', target: 'term-payment' },
      { source: 'contract-001', target: 'term-confidentiality' },
      { source: 'contract-001', target: 'liability-limit' },
      
      // Connect events to relevant parties/terms
      { source: 'event-signing', target: 'party-a' },
      { source: 'event-signing', target: 'party-b' },
      { source: 'event-payment-1', target: 'term-payment' },
      { source: 'event-milestone-1', target: 'party-b' },
    ]
  };
}
