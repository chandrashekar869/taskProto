import { Injectable } from "@angular/core";
import { ConnectionBackend, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
var host=window.location.hostname;
@Injectable()
export class CustomHttp extends Http {
    interval:any;
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
        super(backend, defaultOptions);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        console.log('http://'+host+':80/restAPI' + url);
        return super.get('http://'+host+':3000/restAPI' + url, this.addJwt(url,options)).catch(this.handleError);
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        console.log('http://'+host+':80/restAPI' + url);
        return super.post('http://'+host+':3000/restAPI' + url, body, this.addJwt(url,options)).catch(this.handleError);
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        console.log('http://'+host+':80/restAPI' + url);
        return super.put('http://'+host+':3000/restAPI' + url, body, this.addJwt(url,options)).catch(this.handleError);
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        console.log('http://'+host+':80/restAPI' + url);
        return super.delete('http://'+host+':3000/restAPI' + url, this.addJwt(url,options)).catch(this.handleError);
    }

    // private helper methods

    private addJwt(url,options?: RequestOptionsArgs): RequestOptionsArgs {
        
        // ensure request options and headers are not null
        options = options || new RequestOptions();
        options.headers = options.headers || new Headers();
        // add authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log(currentUser);
        if (currentUser && currentUser.token) {
        console.log("valid",currentUser);
            options.headers.append('Authorization', 'Bearer ' + currentUser.token);
            if(url.indexOf("login") == -1)
            options.headers.append('VerifyLogOut','Email '+JSON.parse(localStorage.getItem('currentUser'))['_id']);
            console.log(options);
        }

        return options;
    }

    private handleError(error: any) {
        if(error.status===405){
console.log("hey");
            clearInterval(this.interval);
            this.interval = setInterval(() =>{
                window.location.href = '/login';
                localStorage.removeItem("currentUser");  
                window.close();                  
            },1000); 
            alert("Admin has updated data.Press Ok to relogin.");
        }
        if (error.status === 401) {
            // 401 unauthorized response so log user out of client
               window.location.href = '/login';
            localStorage.removeItem("currentUser");
        }

        return Observable.throw(error._body);
    }
}

export function customHttpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
    return new CustomHttp(xhrBackend, requestOptions);
}

export let customHttpProvider = {
    provide: Http,
    useFactory: customHttpFactory,
    deps: [XHRBackend, RequestOptions]
};