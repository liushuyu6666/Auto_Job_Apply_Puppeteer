import { Facet, IFacet, IPriority } from '../../myworkdayjobs/Facet';

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
                                        descriptor: 'Canada - Hybrid',
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
                                        descriptor: 'Canada - Remote',
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
                        descriptor: "(USA) OH ONTARIO 06407 SAM'S CLUB",
                        id: 'e83ebdbd2a0a01fe14d3da8245e9d708',
                        count: 10,
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

        expect(facetCards).toMatchSnapshot();
        expect(firstCards).toMatchSnapshot();
    });

    test('getPrioritizedFacetCards retrieves the correct FacetCards and excludes USA cards', () => {
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
            {
                priorityOrder: -1,
                priorityText: 'USA',
            },
        ];
        const facetCards = facet.getPrioritizedFacetCards(
            'locationMainGroup',
            priorities,
        );
        const firstCards = facet.getTheFirstPriorityFacetCards(facetCards);

        expect(facetCards).toMatchSnapshot();
        expect(firstCards).toMatchSnapshot();
    });
});
