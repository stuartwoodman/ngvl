import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import olLayer from 'ol/layer/layer';
import olFeature from 'ol/feature';
import { OlMapObject } from '../../../portal-core-ui/service/openlayermap/ol-map-object';
import {HttpClient, HttpParams} from '@angular/common/http';
import { UtilitiesService } from '../../utility/utilities.service';
import {LayerModel} from '../../model/data/layer.model';
import { OnlineResourceModel } from '../../model/data/onlineresource.model';

@Injectable()
export class QueryWFSService {

    constructor(private http: HttpClient, @Inject('env') private env) {
    }
    /**
     * A get feature info request
     * @param layer the wfs layer for the getfeatureinfo request to be made
     * @param onlineresource the wfs online resource
     * @return Observable the observable from the http request
     */
    public getFeatureInfo(onlineResource: OnlineResourceModel, featureId: string): Observable<any> {
      let httpParams = new HttpParams();
      httpParams = httpParams.append('serviceUrl', onlineResource.url);
      httpParams = httpParams.append('typeName', onlineResource.name);
      httpParams = httpParams.append('featureId', featureId);

      return this.http.get(this.env.portalBaseUrl + 'requestFeature.do', {
        params: httpParams
      }).map(response => {
        if (response['success']) {
          return response['data']['gml'];
        } else {
          return Observable.throw('error');
        }
      }).catch(
        (error: Response) => {
          return Observable.throw(error);
        }
        );

  }
}
