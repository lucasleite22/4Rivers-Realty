'use client'

import { useState } from 'react'
import type { PropertyType } from '@/types/properties'
import HorseFarmFields from './HorseFarmFields'
import FarmFields from './FarmFields'
import LotFields from './LotFields'

interface StepOneData {
  title: string
  type: PropertyType | ''
  priceUsd: string
  acreage: string
  county: string
  city: string
  address: string
  description: string
}

const INITIAL_STEP_ONE: StepOneData = {
  title: '',
  type: '',
  priceUsd: '',
  acreage: '',
  county: '',
  city: '',
  address: '',
  description: '',
}

const STEPS = ['Basic Info', 'Specific Details', 'Photos & Review']

export default function MultiStepForm() {
  const [step, setStep] = useState(0)
  const [stepOne, setStepOne] = useState<StepOneData>(INITIAL_STEP_ONE)

  const field = (key: keyof StepOneData) => ({
    value: stepOne[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setStepOne((prev) => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? 'bg-brand-blue' : 'bg-navy/20'}`} />
            <p className={`font-barlow text-xs mt-1 ${i === step ? 'text-navy' : 'text-gray-400'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 1 — Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <FormField label="Title">
            <input type="text" {...field('title')} className={inputCls} placeholder="e.g. Beautiful Horse Farm in Ocala" />
          </FormField>
          <FormField label="Type">
            <select {...field('type')} className={inputCls}>
              <option value="">Select type</option>
              <option value="HORSE_FARM">Horse Farm</option>
              <option value="RANCH">Ranch</option>
              <option value="LAND">Land</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (USD)">
              <input type="number" {...field('priceUsd')} className={inputCls} placeholder="0" />
            </FormField>
            <FormField label="Acreage">
              <input type="number" {...field('acreage')} className={inputCls} placeholder="0" />
            </FormField>
          </div>
          <FormField label="County">
            <select {...field('county')} className={inputCls}>
              <option value="">Select county</option>
              <option value="Marion">Marion County</option>
              <option value="Sumter">Sumter County</option>
            </select>
          </FormField>
          <FormField label="City">
            <input type="text" {...field('city')} className={inputCls} />
          </FormField>
          <FormField label="Address">
            <input type="text" {...field('address')} className={inputCls} />
          </FormField>
          <FormField label="Description">
            <textarea {...field('description')} rows={4} className={inputCls} />
          </FormField>
        </div>
      )}

      {/* Step 2 — Type-specific fields */}
      {step === 1 && (
        <div>
          {stepOne.type === 'HORSE_FARM' && <HorseFarmFields />}
          {(stepOne.type === 'RANCH' || stepOne.type === 'LAND') && <FarmFields />}
          {(stepOne.type === 'RESIDENTIAL' || stepOne.type === 'COMMERCIAL') && <LotFields />}
          {!stepOne.type && (
            <p className="font-barlow text-gray-400 text-center py-12">
              Go back and select a property type.
            </p>
          )}
        </div>
      )}

      {/* Step 3 — Photos & Review */}
      {step === 2 && (
        <div className="font-barlow text-gray-500 text-center py-12">
          Photo upload — Semana 6
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="font-barlow px-6 py-2 border border-navy/30 rounded-lg text-navy disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          disabled={step === STEPS.length - 1}
          className="font-barlow px-6 py-2 bg-navy text-white rounded-lg hover:opacity-90 disabled:opacity-30"
        >
          {step === STEPS.length - 2 ? 'Review' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-barlow text-sm text-navy/70 block mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-navy/20 rounded-lg px-3 py-2 font-barlow text-navy focus:outline-none focus:border-brand-blue'
