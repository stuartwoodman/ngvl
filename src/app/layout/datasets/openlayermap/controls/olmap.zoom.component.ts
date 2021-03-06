import { OlMapService } from 'portal-core-ui';
import { Component } from '@angular/core';


@Component({
  selector: 'app-ol-map-zoom',
  templateUrl: './olmap.zoom.component.html',
  styleUrls: ['./olmap.zoom.component.scss']
})

export class OlMapZoomComponent {

  buttonText = 'Magnify';

  constructor(private olMapService: OlMapService) {}

  /**
   * toggle on zoom to zoom into bbox
   */
  public zoomClick(): void {
    this.buttonText = 'Click on Map';
    this.olMapService.drawBound().subscribe((vector) => {
      const features = vector.getSource().getFeatures();
      const me = this;
      // Go through this array and get coordinates of their geometry.
      features.forEach(function(feature) {
        me.buttonText = 'Zoom';
        me.olMapService.fitView(feature.getGeometry().getExtent());
      });

    });
  }

  public zoomIn(): void {
    this.olMapService.zoomMapIn();
  }

  public zoomOut(): void {
    this.olMapService.zoomMapOut();
  }
}
