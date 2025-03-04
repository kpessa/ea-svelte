import type { Config } from '$lib/types';

export const sampleConfig: Config = {
  tabs: [
    {
      id: 'magnesium',
      name: 'Magnesium',
      criteria: [
        {
          id: 'mg_level',
          name: 'Serum Magnesium Level',
          type: 'numeric',
          value: 1.8,
          unit: 'mg/dL'
        },
        {
          id: 'symptoms',
          name: 'Symptoms Present',
          type: 'boolean',
          value: false
        },
        {
          id: 'severity',
          name: 'Severity',
          type: 'select',
          value: 'mild',
          options: ['mild', 'moderate', 'severe']
        }
      ],
      orderSections: [
        {
          id: 'labs',
          name: 'Laboratory Tests',
          orders: [
            {
              id: 'mg_repeat',
              name: 'Repeat Magnesium Level',
              type: 'lab',
              details: 'Repeat serum magnesium level in 4 hours'
            }
          ]
        },
        {
          id: 'medications',
          name: 'Medications',
          orders: [
            {
              id: 'mg_supplement',
              name: 'Magnesium Supplement',
              type: 'medication',
              details: 'Magnesium oxide 400mg PO daily'
            }
          ]
        }
      ]
    },
    {
      id: 'potassium',
      name: 'Potassium',
      criteria: [
        {
          id: 'k_level',
          name: 'Serum Potassium Level',
          type: 'numeric',
          value: 3.5,
          unit: 'mEq/L'
        },
        {
          id: 'ecg_changes',
          name: 'ECG Changes',
          type: 'boolean',
          value: false
        }
      ],
      orderSections: [
        {
          id: 'labs',
          name: 'Laboratory Tests',
          orders: [
            {
              id: 'k_repeat',
              name: 'Repeat Potassium Level',
              type: 'lab',
              details: 'Repeat serum potassium level in 2 hours'
            }
          ]
        }
      ]
    }
  ],
  testCases: []
}; 