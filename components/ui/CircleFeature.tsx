import Image from 'next/image'

interface Props {
  image: string
  title: string
  description: string
}

/** Circular-photo feature block — used in 3-up rows that overlap a section seam. */
export default function CircleFeature({ image, title, description }: Props) {
  return (
    <div className="text-center">
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white">
        <Image
          src={image}
          alt={title}
          fill
          sizes="192px"
          className="object-cover"
        />
      </div>
      <h3 className="font-cormorant font-bold text-2xl text-dark-navy mt-6 mb-2">
        {title}
      </h3>
      <p className="font-barlow text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  )
}
