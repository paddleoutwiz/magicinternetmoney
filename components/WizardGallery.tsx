'use client'

import { useState } from 'react'

const wizards = [
  { id: 1, label: 'Wizard #1', color: 'bg-wizard-blue' },
  { id: 70, label: 'MavensBot #70', color: 'bg-bitcoin-orange', special: true },
  { id: 123, label: 'Wizard #123', color: 'bg-wizard-cyan' },
  { id: 420, label: 'Wizard #420', color: 'bg-wizard-highlight' },
  { id: 666, label: 'Wizard #666', color: 'bg-[#ee8e02]' },
  { id: 999, label: 'Wizard #999', color: 'bg-wizard-beard' },
]

export default function WizardGallery() {
  const [clickedWizards, setClickedWizards] = useState<number[]>([])

  const handleWizardClick = (id: number) => {
    setClickedWizards(prev => [...prev, id])
    setTimeout(() => {
      setClickedWizards(prev => prev.filter(wId => wId !== id))
    }, 1000)
  }

  return (
    <section id="wizards" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 p-12 bg-gray-200 border-t-[5px] border-b-[5px] border-wizard-black">
      {wizards.map(wizard => (
        <div
          key={wizard.id}
          className="relative cursor-pointer transition-all hover:-translate-y-2 hover:rotate-[5deg]"
          onClick={() => handleWizardClick(wizard.id)}
        >
          <div className={`w-full h-48 ${wizard.color} border-3 border-wizard-black rounded-[100px_100px_20px_20px] relative ${
            clickedWizards.includes(wizard.id) ? 'animate-spin' : ''
          }`}>
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-wizard-face border-2 border-wizard-black rounded-full" />
            {wizard.special && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-3xl">⭐</div>
            )}
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-magic-yellow px-4 py-1 border-2 border-wizard-black rounded-[10px] font-derp text-sm whitespace-nowrap">
            {wizard.label}
          </div>
          {clickedWizards.includes(wizard.id) && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl animate-[floatUp_1s_ease-out_forwards]">
              ✨
            </div>
          )}
        </div>
      ))}
    </section>
  )
}