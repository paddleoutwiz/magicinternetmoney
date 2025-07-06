import HeroSection from '@/components/HeroSection'
import CommunityLinks from '@/components/CommunityLinks'
import StorySection from '@/components/StorySection'
import FairLaunchSection from '@/components/FairLaunchSection'
import WizardGallery from '@/components/WizardGallery'
import WhyMimSection from '@/components/WhyMimSection'
import MissionSection from '@/components/MissionSection'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'
import MimTicker from '@/components/MimTicker'
import FloatingBitcoins from '@/components/FloatingBitcoins'
import MatrixRain from '@/components/MatrixRain'
import BitcoinVortex from '@/components/BitcoinVortex'
import CursorTrail from '@/components/CursorTrail'
import SuperCrazyFeatures from '@/components/SuperCrazyFeatures'

export default function Home() {
  return (
    <>
      <MatrixRain />
      <BitcoinVortex />
      <CursorTrail />
      <SuperCrazyFeatures />
      
      <MimTicker />
      <Navigation />
      <FloatingBitcoins />
      
      <main className="relative z-10">
        <HeroSection />
        <CommunityLinks />
        <StorySection />
        <MissionSection />
        <FairLaunchSection />
        <WhyMimSection />
        <WizardGallery />
      </main>
      
      <Footer />
    </>
  )
}