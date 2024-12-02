import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilDesignService {

  private renderer2: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer2 = rendererFactory.createRenderer(null, null);
  }

  /**
   * 
   * @param width 
   * @param aspectRatio 
   * Calculate height from width based on aspect ratio.
   * @returns 
   */
   calculateHeightForAspectRatio(width: number, aspectRatio: {width: string, height: string}){
    if(width == undefined || width == -1){
      return 0;
    }

    const aspectRatioWidth = parseInt(aspectRatio.width);
    const aspectRatioHeight = parseInt(aspectRatio.height);

    return Math.ceil((width * aspectRatioHeight) / aspectRatioWidth);
  }

  /**
   * 
   * @param scale 
   * When component is loaded, bootstrap can make width responsive. We also need to maintain ratio
   * for board preview for that we need to scale boardContainer accordingly.
   */
  resize(element: HTMLElement, scale: number) {
    this.renderer2.setStyle( element, 'transform', 'scale('+(scale)+')' );
    this.renderer2.setStyle( element, '-webkit-transform', 'scale('+(scale)+')' );
    this.renderer2.setStyle( element, '-moz-transform', 'scale('+(scale)+')' );
    this.renderer2.setStyle( element, '-o-transform', 'scale('+(scale)+')' );
    this.renderer2.setStyle( element, '-ms-zoom', (scale) );
  }


}
