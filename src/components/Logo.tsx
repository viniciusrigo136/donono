import { company } from '../config/company'

/**
 * Logo aprovada, sem alterações. O arquivo tem fundo transparente; aqui ela é exibida
 * sobre branco por escolha de layout. O leve zoom só reduz a margem vazia do arquivo;
 * proporções e conteúdo permanecem intactos.
 */
export function Logo({ size, priority, className = '' }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden bg-white ${className}`} style={size ? { width: size, height: size } : undefined}>
      <img
        src={company.logo.src}
        alt={company.logo.alt}
        width={size ?? company.logo.width}
        height={size ?? company.logo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="size-full scale-[1.1] object-contain"
      />
    </span>
  )
}
