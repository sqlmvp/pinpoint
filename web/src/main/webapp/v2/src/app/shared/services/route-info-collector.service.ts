import { Injectable } from '@angular/core';
import { ParamMap, ActivatedRoute } from '@angular/router';

import { AnalyticsService } from './analytics.service';
import { NewUrlStateNotificationService } from './new-url-state-notification.service';

@Injectable()
export class RouteInfoCollectorService {
    constructor(
        private newUrlStateNotificationService: NewUrlStateNotificationService,
        private analyticsService: AnalyticsService
    ) {}

    collectUrlInfo(activatedRoute: ActivatedRoute): void {
        /**
         * snapshot: is the constructed route itself.
         * firstChild: starts from the path definition, e.g. the very root path with the resolve at the moment.
         */
        const startPath = activatedRoute.snapshot.firstChild.firstChild.url[0].path;
        const pathIdMap = new Map<string, string>();
        const queryParamMap = new Map<string, string>();
        let innerData = {};
        let routeChild = activatedRoute.snapshot.firstChild;

        while (routeChild) {
            this.setData(pathIdMap, routeChild.paramMap);
            this.setData(queryParamMap, routeChild.queryParamMap);
            innerData = { ...innerData, ...routeChild.data };
            routeChild = routeChild.firstChild;
        }

        this.newUrlStateNotificationService.updateUrl(startPath, pathIdMap, queryParamMap, innerData, activatedRoute.firstChild);
        this.analyticsService.trackPage(startPath);
    }

    private setData(dataMap: Map<string, string>, routeData: ParamMap): void {
        routeData.keys.forEach((key: string) => {
            dataMap.set(key, routeData.get(key));
        });
    }
}
