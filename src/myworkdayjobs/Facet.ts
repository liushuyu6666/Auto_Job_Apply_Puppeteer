import * as lodash from 'lodash';

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

export interface IPriority {
    priorityOrder: number;
    priorityText: string;
}

export interface IFacetCard {
    company: string;
    mainGroupText: string;
    facetParameter: string;
    priority: IPriority;
    facetValue: IFacetValue;
}

export class Facet {
    readonly facets: IFacet[];
    readonly company: string;

    constructor(facets: IFacet[], company: string) {
        this.facets = facets;
        this.company = company;
    }

    private isFacetValue(value: IFacetValue | IFacet): value is IFacetValue {
        return (value as IFacetValue).id !== undefined;
    }

    private dfsValues(
        mainGroupText: string,
        facetParameter: string,
        priorities: IPriority[],
        facetValues: IFacetValue[] | IFacet[],
        facetCards: IFacetCard[],
    ) {
        for (const facetValue of facetValues) {
            if (this.isFacetValue(facetValue)) {
                this.updateFacetCards(
                    mainGroupText,
                    facetParameter,
                    priorities,
                    facetValue,
                    facetCards,
                );
            } else {
                this.dfsValues(
                    mainGroupText,
                    facetValue.facetParameter,
                    priorities,
                    facetValue.values,
                    facetCards,
                );
            }
        }
    }

    private updateFacetCards(
        mainGroupText: string,
        facetParameter: string,
        priorities: IPriority[],
        facetValue: IFacetValue,
        facetCards: IFacetCard[],
    ) {
        const excludes = priorities
            .filter((priority) => priority.priorityOrder < 0)
            .map((priority) => priority.priorityText);

        const { descriptor } = facetValue;

        // If descriptor contains the word that need to be excluded
        if (
            excludes.some((exclude) =>
                descriptor.toLowerCase().includes(exclude.toLowerCase()),
            )
        ) {
            return;
        }

        priorities.forEach((priority) => {
            const { priorityText } = priority;
            if (descriptor.toLowerCase().includes(priorityText.toLowerCase())) {
                facetCards.push({
                    company: this.company,
                    mainGroupText,
                    facetParameter,
                    priority,
                    facetValue,
                });
            }
        });
    }

    getPrioritizedFacetCards(
        mainGroupText: string,
        priorities: IPriority[],
    ): IFacetCard[] {
        const facetCards: IFacetCard[] = [];

        const mainGroup = this.facets.find(
            (facet) => facet.facetParameter === mainGroupText,
        );

        const facetParameter = mainGroup.facetParameter;
        const facetValues = mainGroup.values;
        this.dfsValues(
            mainGroupText,
            facetParameter,
            priorities,
            facetValues,
            facetCards,
        );

        return lodash.sortBy(facetCards, ['priority.priorityOrder']);
    }

    getTheFirstPriorityFacetCards(facetCards: IFacetCard[]): IFacetCard[] {
        const minPriorityOrder = facetCards.reduce(
            (prevPriorityOrder, curr) => {
                return prevPriorityOrder > curr.priority.priorityOrder
                    ? curr.priority.priorityOrder
                    : prevPriorityOrder;
            },
            Number.MAX_VALUE,
        );
        return facetCards.filter(
            (card) => card.priority.priorityOrder === minPriorityOrder,
        );
    }
}
