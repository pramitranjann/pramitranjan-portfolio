import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function SouthChinaSeaPage() {
  return (
    <CaseStudyLayout
      title="South China Sea"
      oneliner="Conflict, naivety, and the decisions of the few."
      type="CYANOTYPE · PHOTOGRAM"
      tags={['Cyanotype', 'Photogram', 'Mixed Media']}
      prev={{ slug: 'faces-of-power', title: 'Faces of Power' }}
      next={null}
      backHref="/creative/mixed-media"
      backLabel="MIXED MEDIA"
    />
  )
}
