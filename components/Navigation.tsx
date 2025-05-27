export default function Navigation() {
  return (
    <nav className="fixed top-5 right-5 flex flex-col md:flex-row gap-5 z-50">
      <a href="#about" className="px-6 py-3 bg-bitcoin-orange border-3 border-wizard-black rounded-[15px_5px_15px_5px] text-xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-[#ee8e02] hover:shadow-[5px_5px_0_#040104] transition-all cursor-magic-wand-active">
        Story
      </a>
      <a href="#launch" className="px-6 py-3 bg-bitcoin-orange border-3 border-wizard-black rounded-[15px_5px_15px_5px] text-xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-[#ee8e02] hover:shadow-[5px_5px_0_#040104] transition-all cursor-magic-wand-active">
        Fair Launch
      </a>
      <a href="#wizards" className="px-6 py-3 bg-bitcoin-orange border-3 border-wizard-black rounded-[15px_5px_15px_5px] text-xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-[#ee8e02] hover:shadow-[5px_5px_0_#040104] transition-all cursor-magic-wand-active">
        Wizards
      </a>
      <a href="#why" className="px-6 py-3 bg-bitcoin-orange border-3 border-wizard-black rounded-[15px_5px_15px_5px] text-xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-[#ee8e02] hover:shadow-[5px_5px_0_#040104] transition-all cursor-magic-wand-active">
        Why MIM?
      </a>
    </nav>
  )
}