<template>
  <EternaPage :title="$t('nav-bar:labs')">
    <Paginator :loading="fetchState.pending" :total="total" :defaultIncrement="increment" @load="$fetch">
      <section class="phase-section" v-for="phase in Object.keys(segmentedLabs)" :key="phase">
        <div class="phase-title" v-b-toggle="`collapse-${phase}`">
          <h3>{{ getPhaseTitle(phase) }}</h3>
          <BIconChevronRight></BIconChevronRight>
        </div>
        <b-collapse :id="`collapse-${phase}`" :visible="phase == '1'" class="mt-2">
          <Gallery setCur>
            <LabCard v-for="lab in segmentedLabs[phase]" :key="lab.nid" :lab="lab" />
          </Gallery>
        </b-collapse>
      </section>
    </Paginator>
    <template #sidebar="{ isInSidebar }">
      <SearchPanel v-if="isInSidebar" :placeholder="$t('search:labs')" :isInSidebar="isInSidebar" />
      <FiltersPanel :filters="filters" paramName="filters" :isInSidebar="isInSidebar" />
      <DropdownSidebarPanel
        :options="options"
        paramName="sort"
        replace
        :isInSidebar="isInSidebar"
      />
      <PaginationPanel v-if="isInSidebar" :shownCount="labs.length" :totalCount="total" />
    </template>
    <template #mobileSearchbar>
      <SearchPanel :placeholder="$t('search:labs')" :isInSidebar="false" />
    </template>
  </EternaPage>
</template>

<script lang="ts">
  import { Component, Mixins } from 'vue-property-decorator';
  import EternaPage from '@/components/PageLayout/EternaPage.vue';
  import SearchPanel from '@/components/Sidebar/SearchPanel.vue';
  import FiltersPanel, { Filter } from '@/components/Sidebar/FiltersPanel.vue';
  import DropdownSidebarPanel, { Option } from '@/components/Sidebar/DropdownSidebarPanel.vue';
  import Preloader from '@/components/PageLayout/Preloader.vue';
  import FetchMixin from '@/mixins/FetchMixin';
  import PaginationPanel from '@/components/Sidebar/PaginationPanel.vue';
  import Paginator, { PaginatorEvent } from '@/components/PageLayout/Paginator.vue';
  import { BIconChevronRight } from 'bootstrap-vue';
  import LabsExploreData, { LabCardData } from './types';
  import LabCard from './components/LabCard.vue';

  @Component({
    components: {
      LabCard,
      SearchPanel,
      EternaPage,
      FiltersPanel,
      DropdownSidebarPanel,
      Preloader,
      PaginationPanel,
      Paginator,
      BIconChevronRight
    },
  })
  export default class LabsExplore extends Mixins(FetchMixin) {
    labs: LabCardData[] = [];

    filters: Filter[] = [
      { value: 'active', text: 'Active' },
      { value: 'inactive', text: 'Inactive' },
    ];

    options: Option[] = [
      { value: 'desc', text: 'side-panel-options:desc' },
      { value: 'asc', text: 'side-panel-options:asc' },
    ];

    total = 0;

    increment = 18;

    async fetch(
      {mode, size, skip}: PaginatorEvent = {
        mode: 'replace',
        skip: +this.$route.query.skip || 0,
        size: +this.$route.query.size || this.increment
      }
    ) {
      const res = (
        await this.$http.get('/get/?type=get_labs_for_lab_cards', {
          params: {
            order: this.$route.query.sort,
            filters: this.$route.query.filters ? this.$route.query.filters : '',
            search: this.$route.query.search,
            size,
            skip
          },
        })
      ).data.data as LabsExploreData;
      if (mode === 'replace') this.labs = res.labs;
      else {
        const newLabs = res.labs.filter(
          (newItem) => !this.labs.some((oldItem) => oldItem.nid === newItem.nid)
        );
        if (mode === 'append') this.labs.push(...newLabs);
        if (mode === 'prepend') this.labs.unshift(...newLabs);
      }
      this.total = +res.num_labs;
    }

    get segmentedLabs(): Record<string, LabCardData[] | []> {
      const segmentedLabs: Record<string, LabCardData[] | []> = {
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
      };
        
      this.labs.map((lab) => {
        // If the lab is older than 2 years old, add to archived labs
        if (new Date(lab.created).getTime() < (new Date().getTime() - (2 * 365 * 24 * 60 * 60 * 1000))) {
          segmentedLabs["6"] = [...segmentedLabs["6"], lab];
        } else if (lab.exp_phase) {
          // If the lab is less than 2 years old, add to the appropriate phase
          segmentedLabs[lab.exp_phase] = [...segmentedLabs[lab.exp_phase], lab];
        } else {
          // If the lab doesn't have an experimental phase, add to archived labs
          segmentedLabs["6"] = [...segmentedLabs["6"], lab];
        }
        return 0;
      });

      return segmentedLabs;
    }

    getPhaseTitle(phase: string) {
      return this.$t(`lab-card:status-${phase}`);
    }
  }
</script>

<style lang="scss">
  .phase-section {
    margin-top: 1rem;

  }
  .phase-title {
    background-color: #043468;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 1.5rem;
    }
    .bi-chevron-right {
      transition: transform 300ms ease-in-out;
    }
  }

  .phase-title.not-collapsed {
    .bi-chevron-right {
      transform: rotate(90deg);
    }
  }
</style>
