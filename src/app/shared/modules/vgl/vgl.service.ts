import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Problem, Problems, Solution, User, TreeJobs, Series, CloudFileInformation, DownloadOptions } from './models';

import { environment } from '../../../../environments/environment';


interface VglResponse<T> {
    data: T;
    msg: string;
    success: boolean;
}

function vglData<T>(response: VglResponse<T>): T {
    return response.data;
}

@Injectable()
export class VglService {

  constructor(private http: HttpClient) { }

  private vglRequest<T>(endpoint: string, options?): Observable<T> {
    const url = environment.portalBaseUrl + endpoint;
    const opts: { observe: 'body' } = options ? { ...options, observe: 'body' } : { observe: 'body' };
    return this.http.get<VglResponse<T>>(url, opts).map(vglData);
  }

  public get user(): Observable<User> {
    return this.vglRequest('secure/getUser.do');
  }

  public get problems(): Observable<Problem[]> {
    return this.vglRequest('secure/getProblems.do')
      .map((problems: Problems) => problems.configuredProblems);
  }

  public get treeJobs(): Observable<TreeJobs> {
    return this.vglRequest('secure/treeJobs.do');
  }

  public addFolder(folderName: string): Observable<Series> {
    const options = {
      params: {
        seriesName: folderName.trim(),
        seriesDescription: ''
      }
    };

    return this.vglRequest('secure/createFolder.do', options);
  }

  public getJobCloudFiles(jobId: number): Observable<CloudFileInformation[]> {
    const options = { params: { jobId: jobId.toString() } };
    return this.vglRequest('secure/jobCloudFiles.do', options);
  }

  public downloadFile(jobId: number, filename: string, key: string): Observable<any> {
    const options = {
      params: {
        jobId: jobId.toString(),
        filename: filename,
        key: key
      },
      responseType: 'text'
    };

    return this.vglRequest('secure/downloadFile.do', options)
      .catch((error: Response) => Observable.throw(error));
    }

  public downloadFilesAsZip(jobId: number, filenames: string[]): Observable<any> {
    const options = {
      params: {
        jobId: jobId.toString(),
        files: filenames.toString()
      },
      responseType: 'blob'
    };

    return this.vglRequest('secure/downloadAsZip.do', options)
      .catch((error: Response) => Observable.throw(error));
  }

    public getPlaintextPreview(jobId: number, file: string, maxSize: number): Observable<string> {
      const options = {
        params: {
          jobId: jobId.toString(),
          file: file,
          maxSize: maxSize.toString()
        }
      };

      return this.vglRequest('secure/getPlaintextPreview.do', options);
    }

    /*
    public getImagePreview(jobId: number, filename: string): Observable<ImageData> {
      return this.vglRequest('secure/getImagePreview.do');
    }
    */

    public deleteJob(jobId: number): Observable<any> {
      const options = {
        params: { jobId: jobId.toString() }
      };

      return this.vglRequest('secure/deleteJob.do', options);
    }

    public deleteSeries(seriesId: number): Observable<any> {
      const options = {
        params: { seriesId: seriesId.toString() }
      };

      return this.vglRequest('secure/deleteSeriesJobs.do', options);
    }

    public cancelJob(jobId: number): Observable<any> {
      const options = {
        params: { jobId: jobId.toString() }
      };

      return this.vglRequest('secure/killJob.do', options);
    }

    public duplicateJob(jobId: number, files: string[]): Observable<any> {
      const options = {
        params: {
          jobId: jobId.toString(),
          files: files.join(',')
        }
      };

      return this.vglRequest('secure/duplicateJob.do', options);
    }

    public updateOrCreateJob(name: string, description: string, seriesId: number,
        computeServiceId, string, computeVmId: string,
        computeVmRunCommand: string, computeTypeId: string, ncpus: number,
        jobfs: number, mem: number, registeredUrl: string,
        emailNotification: boolean, walltime: number): Observable<any> {
        let httpParams: HttpParams = new HttpParams();

        for (let arg in arguments) {
            //params.set(arg.toString(), )
        }
        /*
        if (name)
            params.set('name', name);
        if(description)
            params.set('description', description);
        if(seriesId)
            params.set('seriesId', seriesId);
        if(computeServiceId)
            params.set('', );
        if(computeVmId)
            params.set('', );
        if(computeVmRunCommand)
            params.set('', );
        if(computeTypeId)
            params.set('', );
        if(ncpus)
            params.set('', );
        if(jobfs)
            params.set('', );
        if(mem)
            params.set('', );
        if(registeredUrl)
            params.set('', );
        if(emailNotification)
            params.set('', );
        if(walltime)
            params.set('', );
        */
      return this.vglRequest('secure/updateOrCreateJob.do', {params: httpParams});
  }

    public submitJob(jobId: number): Observable<any> {
      const options = {
        params: { jobId: jobId.toString() }
      };

      return this.vglRequest('secure/submitJob.do', options);
    }

    public getAuditLogs(jobId: number): Observable<any> {
      const options = {
        params: { jobId: jobId.toString() }
      };

      return this.vglRequest('secure/getAuditLogsForJob.do', options);
    }

    /**
     * Create a list of HTTP parameters by parsing URL string, e.g:
     * http://someaddress.com?first_parameter=value1&second_parameters=value2
     *
     * @param url
     */
    private createHttpParamsFromUrl(url: string): HttpParams {
        let httpParams: HttpParams = new HttpParams();
        const urlParameters: string[] = url.split('?');
        if (urlParameters.length == 2) {
            for (let keyValuePair in urlParameters[1].split('&')) {
                httpParams.set(keyValuePair.split('=')[0], keyValuePair.split('=')[1]);
            }
        }
        return httpParams;
    }

    /**
     * Create a list of HTTP parameters from the key/value pairs of a JSON
     * object
     *
     * @param jsonObject
     */
    private createHttpParamsFromJsonObject(jsonObject: any): HttpParams {
        let httpParams = new HttpParams();
        for (let param in jsonObject) {
            httpParams = httpParams.set(param, jsonObject[param]);
        }
        return httpParams;
    }

    public makeErddapUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeErddapUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeWfsUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeWfsUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeNetcdfsubseserviceUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeNetcdfsubseserviceUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public makeDownloadUrl(dlOptions: DownloadOptions): Observable<any> {
        const httpParams = this.createHttpParamsFromJsonObject(dlOptions);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'makeDownloadUrl.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

    public getRequestedOutputFormats(serviceUrl: string): Observable<any> {
        const httpParams = new HttpParams().set('serviceUrl', serviceUrl);
        return this.http.get<VglResponse<any>>(environment.portalBaseUrl + 'getFeatureRequestOutputFormats.do', { params: httpParams })
            .map(vglData)
            .map(response => response);
    }

  public getEntry<T>(url: string): Observable<T> {
    return url ? this.http.get<T>(url) : Observable.empty();
  }

  public getSolution(url: string): Observable<Solution> {
    return this.getEntry<Solution>(url);
  }
}
