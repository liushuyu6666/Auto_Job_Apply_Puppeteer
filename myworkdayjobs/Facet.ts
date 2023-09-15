export interface IFacetValue {
    descriptor: string;
    id: string;
    count: number;
}

export interface IFacet {
    facetParameter: string;
    descriptor?: string;
    values: IFacetValue[] | IFacet[];
}

export interface IFacetBrief {
    id: string;
    count: number;
    descriptor: string;
    facetParameter: string;
}

export interface IFacetDetail {
    priority: number;
    values: IFacetBrief[];
}

export type FacetSelector = Map<string, IFacetBrief[]>;

export type FacetSelectorDetail = Map<string, IFacetDetail>;

export type FacetParameterDetail = Map<string, FacetSelectorDetail>;

export class Facet {
    readonly facets: IFacet[];

    constructor(facets: IFacet[]) {
        this.facets = facets;
    }

    private isFacetValue(value: IFacetValue | IFacet): value is IFacetValue {
        return (value as IFacetValue).id !== undefined;
    }

    private dfsValues(
        values: IFacetValue[] | IFacet[],
        facetParameter: string,
        facetSelector: Map<string, IFacetBrief[]>,
    ) {
        for (const value of values) {
            if (this.isFacetValue(value)) {
                this.updateFacetSelector(value, facetParameter, facetSelector);
            } else {
                this.dfsValues(
                    value.values,
                    value.facetParameter,
                    facetSelector,
                );
            }
        }
    }

    private updateFacetSelector(
        value: IFacetValue,
        facetParameter: string,
        facetSelector: Map<string, IFacetBrief[]>,
    ) {
        const facetDescriptor = value.descriptor;
        Array.from(facetSelector.keys()).forEach((loc) => {
            if (facetDescriptor.toLowerCase().indexOf(loc.toLowerCase()) >= 0) {
                facetSelector.get(loc).push({
                    ...value,
                    facetParameter,
                });
            }
        });
    }

    getFacetParameterDetail(
        mainGroupText: string,
        facetPriority: Map<string, number>,
    ): FacetParameterDetail {
        const facetSelector = new Map<string, IFacetBrief[]>();
        Array.from(facetPriority.keys()).forEach((facet) =>
            facetSelector.set(facet, []),
        );

        const mainGroup = this.facets.find(
            (facet) => facet.facetParameter === mainGroupText,
        );

        const values = mainGroup.values;
        this.dfsValues(values, mainGroupText, facetSelector);

        const facetParameterDetail: FacetParameterDetail = new Map();
        const facetSelectorDetail: FacetSelectorDetail = new Map();
        for (const [facet, brief] of facetSelector) {
            const priority = facetPriority.get(facet);
            const facetDetail: IFacetDetail = {
                priority,
                values: brief,
            };
            facetSelectorDetail.set(facet, facetDetail);
        }

        facetParameterDetail.set(mainGroupText, facetSelectorDetail);
        return facetParameterDetail;
    }
}
