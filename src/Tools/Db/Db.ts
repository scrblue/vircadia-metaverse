//   Copyright 2021 Vircadia Contributors
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

// This is a module that defines a common interface for database layers. By default used by a
// MongoDB driver and an in-memory map used for testing.
'use strict'

import { CriteriaFilter } from '@Entities/EntityFilters/CriteriaFilter';
import { VKeyedCollection } from '@Tools/vTypes';

export interface DBLayer {
    setupDB: () => Promise<void>,

    createObject: (pCollection: string, pObject: any) => Promise<any>,

    getObject: (pCollection: string, pCriteria: CriteriaFilter, pCollation?: any) => Promise<any>,
    getObjects: (pCollection: string, pPager?: CriteriaFilter, pInfoer?: CriteriaFilter, pScoper?: CriteriaFilter) => AsyncGenerator<any>,

    updateObjectFields: (pCollection: string, pCriteria: CriteriaFilter, pFields: VKeyedCollection)
        => Promise<any>,

    deleteOne: (pCollection: string, pCriteria: CriteriaFilter) => Promise<boolean>,
    deleteMany: (pCollection: string, pCriteria: CriteriaFilter) => Promise<number>,

    countObjects: (pCollection: string, pCriteria: CriteriaFilter) => Promise<number>,
};

export let  noCaseCollation: any = {
    locale: 'en_US',
    strength: 2
}
