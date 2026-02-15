'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Download, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

// Social media icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
  </svg>
)

interface ShareButtonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function ShareButtons({ canvasRef }: ShareButtonsProps) {
  const [isSending, setIsSending] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSavingTelegram, setIsSavingTelegram] = useState(false)
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
  }>({ isOpen: false, title: '', message: '', type: 'info' })
  const { type, title, quote, author, isGenerating } = useEditorStore()

  const showModal = (modalTitle: string, message: string, type: 'success' | 'error' | 'info') => {
    setModal({ isOpen: true, title: modalTitle, message, type })
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  // Convert canvas to blob
  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/png', 1.0)
    })
  }

  // Get share text - different formatting per service type
  const getShareText = () => {
    switch (type) {
      case 'jour':
        return `🌅 Pensée du Jour\n\n« ${quote} »\n\n${author ? `— ${author}` : ''}`
      case 'saint':
        return `✝️ Pensée de Saint\n\n« ${quote} »\n\n${author ? `— ${author}` : ''}`
      case 'ciel':
        return `🙏 #UnRegardAuCiel\n\n${title ? `${title}\n\n` : ''}${quote ? `« ${quote} »\n\n` : ''}${author ? `— ${author}` : ''}`
      case 'evangile':
        return `📖 L'Évangile Illustré\n\n${title ? `${title}\n\n` : ''}${quote ? `« ${quote} »\n\n` : ''}${author ? `— ${author}` : ''}`
      default:
        return `${title}\n\n« ${quote} »\n\n${author ? `— ${author}` : ''}`
    }
  }

  // Export PNG (local download only)
  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsSending(true)
    
    const imageData = canvas.toDataURL('image/png', 1.0)
    
    // Download locally
    const link = document.createElement('a')
    link.download = `vds-${type}-${Date.now()}.png`
    link.href = imageData
    link.click()
    
    setIsSending(false)
  }

  // Save to Telegram (dedicated button)
  const handleSaveToTelegram = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsSavingTelegram(true)
    
    try {
      const imageData = canvas.toDataURL('image/png', 1.0)
      // Telegram caption - just the service title, no "VDS Montage"
      let serviceLabel = ''
      switch (type) {
        case 'jour': serviceLabel = '🌅 Pensée du Jour'; break
        case 'saint': serviceLabel = '✝️ Pensée de Saint'; break
        case 'ciel': serviceLabel = '🙏 #UnRegardAuCiel'; break
        case 'evangile': serviceLabel = '📖 L\'Évangile Illustré'; break
      }
      const caption = `${serviceLabel}\n\n${title ? `${title}\n\n` : ''}${quote ? `« ${quote.substring(0, 150)}${quote.length > 150 ? '...' : ''} »\n\n` : ''}${author ? `— ${author}` : ''}`
      
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, caption }),
      })
      
      if (response.ok) {
        showModal('Succès', 'Image sauvegardée sur Telegram !', 'success')
      } else {
        showModal('Erreur', 'Erreur lors de la sauvegarde sur Telegram', 'error')
      }
    } catch (error) {
      console.error('Failed to send to Telegram:', error)
      showModal('Erreur', 'Erreur de connexion à Telegram', 'error')
    } finally {
      setIsSavingTelegram(false)
    }
  }

  // Generic share function (no Telegram)
  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'instagram') => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSharing(true)

    try {
      const imageData = canvas.toDataURL('image/png', 1.0)
      const blob = await canvasToBlob(canvas)
      const file = new File([blob], 'vds-montage.png', { type: 'image/png' })
      const shareText = getShareText()

      // Try Web Share API first (works on mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const shareTitles: Record<string, string> = {
          jour: 'Pensée du Jour',
          saint: 'Pensée de Saint',
          ciel: 'Un Regard au Ciel',
          evangile: "L'Évangile Illustré",
        }
        await navigator.share({
          files: [file],
          title: shareTitles[type] || title,
          text: shareText,
        })
      } else {
        // Fallback: Download image and open platform
        const link = document.createElement('a')
        link.href = imageData
        link.download = `vds-${type}-${Date.now()}.png`
        link.click()

        let url = ''
        switch (platform) {
          case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n(Image téléchargée)')}`
            break
          case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`
            break
          case 'instagram':
            showModal('Instagram', 'Image téléchargée ! Ouvre Instagram et partage depuis ta galerie.', 'info')
            break
        }
        if (url) window.open(url, '_blank')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      <div className="flex flex-col gap-2">
        <button
        onClick={handleExport}
        disabled={isGenerating || isSending}
        className="flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-primary hover:bg-primary/90 text-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        <Download className="w-4 h-4" />
        TÉLÉCHARGER PNG
      </button>
      
      <button
        onClick={handleSaveToTelegram}
        disabled={isGenerating || isSavingTelegram}
        className="flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-[#0088cc] hover:bg-[#0077b5] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isSavingTelegram ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <TelegramIcon className="w-4 h-4" />
        )}
        SAUVEGARDER TELEGRAM
      </button>
      
      <div className="grid grid-cols-3 gap-2 mt-1">
        <button
          onClick={() => handleShare('whatsapp')}
          disabled={isGenerating || isSharing}
          className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <WhatsAppIcon className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          disabled={isGenerating || isSharing}
          className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FacebookIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleShare('instagram')}
          disabled={isGenerating || isSharing}
          className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <InstagramIcon className="w-4 h-4" />
        </button>
        </div>
      </div>
    </>
  )
}
