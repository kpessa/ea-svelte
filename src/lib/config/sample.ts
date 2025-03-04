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
          unit: 'mg/dL',
          validation: {
            min: 0.5,
            max: 3.0,
            required: true
          }
        },
        {
          id: 'symptoms',
          name: 'Symptoms Present',
          type: 'boolean',
          value: false,
          validation: {
            required: true
          }
        },
        {
          id: 'severity',
          name: 'Severity',
          type: 'select',
          value: 'mild',
          options: ['mild', 'moderate', 'severe'],
          validation: {
            required: true
          }
        }
      ],
      orderSections: [
        {
          id: 'labs',
          name: 'Laboratory Tests',
          visibilityExpression: '$mg_level < 1.5',
          orders: [
            {
              id: 'mg_repeat',
              name: 'Repeat Magnesium Level',
              type: 'lab',
              details: 'Repeat serum magnesium level in 4 hours',
              visibilityExpression: '$mg_level < 1.5'
            }
          ]
        },
        {
          id: 'medications',
          name: 'Medications',
          visibilityExpression: '$mg_level < 1.5 && $symptoms',
          orders: [
            {
              id: 'mg_supplement',
              name: 'Magnesium Supplement',
              type: 'medication',
              details: 'Magnesium oxide 400mg PO daily',
              visibilityExpression: '$severity === "moderate" || $severity === "severe"'
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
          unit: 'mEq/L',
          validation: {
            min: 2.5,
            max: 6.0,
            required: true
          }
        },
        {
          id: 'ecg_changes',
          name: 'ECG Changes',
          type: 'boolean',
          value: false,
          validation: {
            required: true
          }
        }
      ],
      orderSections: [
        {
          id: 'labs',
          name: 'Laboratory Tests',
          visibilityExpression: '$k_level < 3.0 || $k_level > 5.0',
          orders: [
            {
              id: 'k_repeat',
              name: 'Repeat Potassium Level',
              type: 'lab',
              details: 'Repeat serum potassium level in 2 hours',
              visibilityExpression: '$k_level < 3.0 || $k_level > 5.0'
            }
          ]
        }
      ]
    }
  ],
  testCases: []
}; 