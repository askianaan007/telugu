import { z } from 'zod'

export const contactInquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().min(8).max(20),
  message: z.string().min(20).max(2000),
})

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>
