export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const pageview = (url: URL) => {
  // @ts-ignore
  GA_TRACKING_ID &&
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
}

type GTagEvent = {
  action: string
  category: string
  label: string
  value: number
}

export const event = ({ action, category, label, value }: GTagEvent) => {
  GA_TRACKING_ID &&
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
}
