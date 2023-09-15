import {
    Facet,
    IFacet,
    IFacetCard,
    IPriority,
} from '../../myworkdayjobs/Facet';

const mockFacets: IFacet[] = [
    {
        facetParameter: 'timeType',
        descriptor: 'Time Type',
        values: [
            {
                descriptor: 'Full time',
                id: 'b181d8271e36017533d4ca68eee44f00',
                count: 16207,
            },
            {
                descriptor: 'Part time',
                id: 'b181d8271e3601fa68bcca68eee44e00',
                count: 2136,
            },
        ],
    },
    {
        facetParameter: 'locationMainGroup',
        values: [
            {
                facetParameter: 'locationCountry',
                values: [
                    {
                        facetParameter: 'locationAmericaCountry',
                        values: [
                            {
                                facetParameter: 'locationCountryCanada',
                                values: [
                                    {
                                        descriptor: 'Canada1',
                                        id: 'a30a87ed25634629aa6c3958aa2b91ea',
                                        count: 4108,
                                    },
                                    {
                                        descriptor: 'India',
                                        id: 'c4f78be1a8f14da0ab49ce1162348a5e',
                                        count: 249,
                                    },
                                    {
                                        descriptor: 'United States of America',
                                        id: 'bc33aa3152ec42d4995f4791a106ed09',
                                        count: 14820,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        facetParameter: 'locationIndiaCountry',
                        values: [
                            {
                                facetParameter: 'locationCountryCanada2',
                                values: [
                                    {
                                        descriptor: 'Canada2',
                                        id: 'a30a87ed25634629aa6c3958aa2b91eb',
                                        count: 4108,
                                    },
                                    {
                                        descriptor: 'India',
                                        id: 'c4f78be1a8f14da0ab49ce1162348a5e',
                                        count: 249,
                                    },
                                    {
                                        descriptor: 'United States of America',
                                        id: 'bc33aa3152ec42d4995f4791a106ed09',
                                        count: 14820,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                facetParameter: 'locationRegionStateProvince',
                descriptor: 'Location Region/State/Province',
                values: [
                    {
                        descriptor: 'Ontario',
                        id: '745d76f06d2b41738aecee630c5888a0',
                        count: 49,
                    },
                    {
                        descriptor: 'Yukon',
                        id: 'ce083ebfbc2843ea9d34e6f6d19ff1dd',
                        count: 8,
                    },
                ],
            },
            {
                facetParameter: 'primaryLocation',
                descriptor: 'Primary Location',
                values: [
                    {
                        descriptor: 'Texarkana, TX',
                        id: '2ff9989b58280101b1221f3344870000',
                        count: 8,
                    },
                    {
                        descriptor: 'Toronto (Stockyards), ON',
                        id: 'aca8753d865c0101b1ab62fcadce0000',
                        count: 3,
                    },
                ],
            },
        ],
    },
];

const mockFacetCards: IFacetCard[] = [
    {
        company: 'walmart',
        mainGroupText: 'locationMainGroup',
        facetParameter: 'primaryLocation',
        priority: {
            priorityOrder: 1,
            priorityText: 'Toronto',
        },
        facetValue: {
            descriptor: 'Toronto (Stockyards), ON',
            id: 'aca8753d865c0101b1ab62fcadce0000',
            count: 3,
        },
    },
    {
        company: 'walmart',
        mainGroupText: 'locationMainGroup',
        facetParameter: 'locationRegionStateProvince',
        priority: {
            priorityOrder: 2,
            priorityText: 'Ontario',
        },
        facetValue: {
            descriptor: 'Ontario',
            id: '745d76f06d2b41738aecee630c5888a0',
            count: 49,
        },
    },
    {
        company: 'walmart',
        mainGroupText: 'locationMainGroup',
        facetParameter: 'locationCountryCanada',
        priority: {
            priorityOrder: 3,
            priorityText: 'Canada',
        },
        facetValue: {
            descriptor: 'Canada1',
            id: 'a30a87ed25634629aa6c3958aa2b91ea',
            count: 4108,
        },
    },
    {
        company: 'walmart',
        mainGroupText: 'locationMainGroup',
        facetParameter: 'locationCountryCanada2',
        priority: {
            priorityOrder: 3,
            priorityText: 'Canada',
        },
        facetValue: {
            descriptor: 'Canada2',
            id: 'a30a87ed25634629aa6c3958aa2b91eb',
            count: 4108,
        },
    },
];

const mockFirstFacetCards: IFacetCard[] = [
    {
        company: 'walmart',
        mainGroupText: 'locationMainGroup',
        facetParameter: 'primaryLocation',
        priority: {
            priorityOrder: 1,
            priorityText: 'Toronto',
        },
        facetValue: {
            descriptor: 'Toronto (Stockyards), ON',
            id: 'aca8753d865c0101b1ab62fcadce0000',
            count: 3,
        },
    },
];

const mockLocationsPriority: Map<string, number> = new Map();
mockLocationsPriority.set('Toronto', 1);
mockLocationsPriority.set('Ontario', 2);
mockLocationsPriority.set('Canada', 3);

const mockTimeTypePriority: Map<string, number> = new Map();
mockTimeTypePriority.set('Full time', 1);

describe('Facet', () => {
    let facet: Facet;

    beforeEach(() => {
        facet = new Facet(mockFacets, 'walmart');
    });

    test('getPrioritizedFacetCards retrieves the correct FacetCards, and getTheFirstPriorityFacetCards extract the first priority cards', () => {
        const priorities: IPriority[] = [
            {
                priorityOrder: 1,
                priorityText: 'Toronto',
            },
            {
                priorityOrder: 2,
                priorityText: 'Ontario',
            },
            {
                priorityOrder: 3,
                priorityText: 'Canada',
            },
        ];
        const facetCards = facet.getPrioritizedFacetCards(
            'locationMainGroup',
            priorities,
        );
        const firstCards = facet.getTheFirstPriorityFacetCards(facetCards);

        expect(facetCards).toEqual(mockFacetCards);
        expect(firstCards).toEqual(mockFirstFacetCards);
    });
});
