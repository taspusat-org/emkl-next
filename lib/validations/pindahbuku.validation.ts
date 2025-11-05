import { z } from 'zod';
import { dynamicRequiredMessage } from '../utils';

export const pindahBukuSchema = z.object({
  // id: z.number().nullable().optional(),
  nobukti: z.string().nullable(),
  tglbukti: z
    .string({ message: dynamicRequiredMessage('TGL BUKTI') })
    .nonempty({ message: dynamicRequiredMessage('TGL BUKTI') }),

  bankdari_id: z
    .number({
      required_error: dynamicRequiredMessage('BANK DARI')
      // invalid_type_error: dynamicRequiredMessage('BANK DARI')
    })
    // .int({ message: dynamicRequiredMessage('BANK DARI') })
    .min(1, { message: dynamicRequiredMessage('BANK DARI') }),
  bankdari_nama: z.string().nullable().optional(),

  bankke_id: z
    .number({
      required_error: dynamicRequiredMessage('BANK KE')
    })
    .min(1, { message: dynamicRequiredMessage('BANK KE') }),
  bankke_nama: z.string().nullable().optional(),

  alatbayar_id: z
    .number()
    .int({ message: dynamicRequiredMessage('BANK KE') })
    .min(1, { message: dynamicRequiredMessage('BANK KE') }),
  alatbayar_nama: z.string().nullable().optional(),

  nowarkat: z.string().nullable().optional(),
  // nowarkat: z
  //   .string({ message: dynamicRequiredMessage('nowarkat') })
  //   .nonempty({ message: dynamicRequiredMessage('nowarkat') }),

  tgljatuhtempo: z
    .string({ message: dynamicRequiredMessage('TGL JATUH TEMPO') })
    .nonempty({ message: dynamicRequiredMessage('TGL JATUH TEMPO') }),

  nominal: z
    .string({ message: dynamicRequiredMessage('NOMINAL') })
    .nonempty({ message: dynamicRequiredMessage('NOMINAL') }),

  keterangan: z
    .string({ message: dynamicRequiredMessage('KETERANGAN') })
    .nonempty({ message: dynamicRequiredMessage('KETERANGAN') })
});
// .refine((data) => {
//

//   if (data.alatbayar_nama === "Other" && !data.alatbayar_nama) {
//     return false; // Validation fails if "Other" is selected but otherReason is empty
//   }
//   return true;
// }, {
//   message: "Please specify the reason when 'Other' is selected.",
//   path: ["otherReason"], // Associate the error with the otherReason field
// });

// const result = pindahBukuSchema.safeParse({ alatbayar_nama: "GIRO" });
//

export type pindahBukuInput = z.infer<typeof pindahBukuSchema>;
