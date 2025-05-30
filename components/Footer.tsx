export default function Footer() {
  return (
    <footer className="bg-wizard-black text-white py-12 text-center relative overflow-hidden">
      <div className="absolute text-[200px] opacity-10 -top-12 -right-12 rotate-[-15deg]">₿</div>
      
      <h3 className="text-5xl mb-5 font-derp tracking-tight">✨ Magic Internet Money ✨</h3>
      <p className="text-2xl mb-2">© 2013-∞ Bitcoin Wizards | Pure Culture, No Utility, Maximum Whimsy</p>
      <p className="opacity-70 text-2xl">Est. 2013 by <a href="https://x.com/mavensbot" className="hover:text-magic-yellow transition-colors">@mavensbot</a> | Hodl the Magic</p>
      
      <p className="mt-10 text-xl opacity-60 max-w-3xl mx-auto px-5">
        By engaging with Magic Internet Money, participants agree to embrace its lack of utility as part of its charm, 
        revel in the cultural history it represents, and acknowledge that the only sorcery involved is the one that conjures smiles.
      </p>
    </footer>
  )
}