import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL for a given seed
 */
export async function generateSeedQRCode(seedId: string, seedData: {
  common_name: string;
  variety: string;
  owner_id: string;
}): Promise<string> {
  const qrData = {
    type: 'seed',
    id: seedId,
    name: `${seedData.common_name} - ${seedData.variety}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/library/${seedId}`,
  };

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Upload QR code to Supabase Storage
 */
export async function uploadQRCode(
  supabase: any,
  seedId: string,
  qrCodeDataUrl: string
): Promise<string> {
  try {
    // Convert data URL to blob
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const fileName = `${seedId}.png`;
    const { data, error } = await supabase.storage
      .from('qr-codes')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    throw new Error('Failed to upload QR code');
  }
}

/**
 * Generate and upload QR code for a seed
 */
export async function createSeedQRCode(
  supabase: any,
  seedId: string,
  seedData: {
    common_name: string;
    variety: string;
    owner_id: string;
  }
): Promise<string> {
  // Generate QR code
  const qrCodeDataUrl = await generateSeedQRCode(seedId, seedData);

  // Upload to storage
  const publicUrl = await uploadQRCode(supabase, seedId, qrCodeDataUrl);

  // Update seed with QR code URL
  await supabase
    .from('seeds')
    .update({ qr_code_url: publicUrl })
    .eq('id', seedId);

  return publicUrl;
}
