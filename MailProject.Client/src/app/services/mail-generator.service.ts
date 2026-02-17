import { Injectable } from '@angular/core';

export interface MailBlock {
    id: string;
    type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'columns';
    content?: string;
    styles?: {
        color?: string;
        bgColor?: string;
        align?: 'left' | 'center' | 'right';
        paddingTop?: number;
        paddingBottom?: number;
        paddingLeft?: number;
        paddingRight?: number;
        borderRadius?: number;
        fontSize?: number;
        fontWeight?: string;
        fontFamily?: string;
    };
    config?: {
        logoUrl?: string;
        url?: string;
        textColor?: string;
        bgColor?: string;
        height?: string;
        columns?: MailBlock[][]; // For nested columns
        socialLinks?: { type: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'web'; url: string }[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class MailGeneratorService {

    generateHtml(blocks: MailBlock[]): string {
        let contentHtml = '';

        for (const block of blocks) {
            contentHtml += this.renderBlock(block);
        }

        return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Mail Template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style type="text/css">
        body { margin: 0; padding: 0; min-width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        img { display: block; height: auto !important; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .col-stack { display: block !important; width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);">
                    <tr>
                        <td style="padding: 0;">
                            ${contentHtml}
                        </td>
                    </tr>
                </table>
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="margin-top: 24px;">
                    <tr>
                        <td align="center" style="font-size: 12px; color: #94a3b8; padding: 20px; font-weight: 500;">
                            &copy; 2026 MailProject. Tüm Hakları Saklıdır.<br/>
                            Bu e-posta listemize üye olduğunuz için gönderilmiştir.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    private renderBlock(block: MailBlock): string {
        const styles = block.styles || {};
        const pt = styles.paddingTop ?? 20;
        const pb = styles.paddingBottom ?? 20;
        const pl = styles.paddingLeft ?? 40;
        const pr = styles.paddingRight ?? 40;
        const padding = `${pt}px ${pr}px ${pb}px ${pl}px`;

        switch (block.type) {
            case 'header':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td align="${styles.align || 'center'}" style="padding: ${padding}; background-color: ${block.config?.bgColor || '#ffffff'}; border-bottom: 1px solid #f1f5f9;">
                      ${block.config?.logoUrl ? `<img src="${block.config.logoUrl}" style="max-height: 48px; width: auto;">` : `<span style="font-size: 20px; font-weight: 900; color: ${block.config?.textColor || '#1e293b'}; letter-spacing: 3px; font-family: 'Outfit', sans-serif;">LOGO</span>`}
                  </td>
              </tr>
          </table>`;

            case 'text':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: ${padding}; font-size: ${styles.fontSize || 16}px; line-height: 1.7; color: ${styles.color || '#334155'}; font-family: ${styles.fontFamily || 'inherit'}; font-weight: ${styles.fontWeight || 'normal'}; text-align: ${styles.align || 'left'};">
                      ${block.content || 'Metin girilmemiş...'}
                  </td>
              </tr>
          </table>`;

            case 'button':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td align="${styles.align || 'center'}" style="padding: ${padding};">
                      <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                              <td align="center" bgcolor="${styles.bgColor || '#4f46e5'}" style="border-radius: ${styles.borderRadius || 12}px;">
                                  <a href="${block.config?.url || '#'}" style="display: inline-block; padding: 18px 36px; font-size: 15px; font-weight: 800; color: ${styles.color || '#ffffff'}; border-radius: ${styles.borderRadius || 12}px; letter-spacing: 0.5px;">
                                      ${block.content || 'Harekete Geç'}
                                  </a>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>`;

            case 'image':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td align="${styles.align || 'center'}" style="padding: ${padding};">
                      <img src="${block.config?.url || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800'}" width="100%" style="width: 100%; max-width: 100%; border-radius: ${styles.borderRadius || 16}px; display: block;">
                  </td>
              </tr>
          </table>`;

            case 'divider':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: ${padding};">
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;">
                  </td>
              </tr>
          </table>`;

            case 'spacer':
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td height="${block.config?.height || '30'}" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
              </tr>
          </table>`;

            case 'social':
                const links = block.config?.socialLinks || [];
                const getSocialIcon = (type: string) => {
                    const icons: any = {
                        facebook: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
                        twitter: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png', // New X/Twitter logo
                        instagram: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
                        linkedin: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
                        web: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png' // Web globe icon
                    };
                    return icons[type] || icons.web;
                };
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td align="${styles.align || 'center'}" style="padding: ${padding};">
                      <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                              ${links.map((link: any) => `
                                <td style="padding: 0 8px;">
                                    <a href="${link.url}"><img src="${getSocialIcon(link.type)}" width="32" height="32" style="width:32px; height:32px; display:inline-block;"></a>
                                </td>
                              `).join('')}
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>`;

            case 'columns':
                const columns = block.config?.columns || [];
                const colWidth = Math.floor(100 / (columns.length || 1));
                return `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: ${padding};">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                              ${columns.map((colBlocks: any) => `
                                <td width="${colWidth}%" valign="top" class="col-stack" style="padding: 10px;">
                                    ${colBlocks.map((b: any) => this.renderBlock(b)).join('')}
                                </td>
                              `).join('')}
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>`;

            default:
                return '';
        }
    }
}
