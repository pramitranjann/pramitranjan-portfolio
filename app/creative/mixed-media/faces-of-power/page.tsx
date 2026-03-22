import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function FacesOfPowerPage() {
  return (
    <CaseStudyLayout
      title="Faces of Power"
      oneliner="Portraits, power, and the masks we wear."
      type="GELLI PRINT · PHOTOGRAPHY"
      tags={['Gelli Print', 'Photography', 'Mixed Media']}
      prev={null}
      next={{ slug: 'south-china-sea', title: 'South China Sea' }}
      backHref="/creative/mixed-media"
      backLabel="MIXED MEDIA"
    />
  )
}
