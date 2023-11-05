import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramsService } from '../../services/programs.service';
import { ProgramPreviewComponent } from '../program-preview/program-preview.component';
import { ListboxModule } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgramDescriptionPipe } from '../program-description.pipe';
import { Router, RouterLink } from '@angular/router';
import { FrontendProgram } from '../../shared/types';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SubSink } from 'subsink';
import { SelectedItemPlaceholderComponent } from '../../shared/selected-item-placeholder/selected-item-placeholder.component';
import { RESOURCE_MAP } from '../../global';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgramPreviewComponent,
    ListboxModule,
    ButtonModule,
    ProgramDescriptionPipe,
    RouterLink,
    ToggleButtonModule,
    SelectedItemPlaceholderComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit, OnDestroy {

  selectedProgram?: FrontendProgram;

  resourceMap = RESOURCE_MAP;

  subs = new SubSink();

  passedData = {
    programKey: undefined,
  }

  constructor(
    public programsService: ProgramsService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const { programKey } = navigation?.extras?.state || {};

    this.passedData.programKey = programKey;
  }

  ngOnInit(): void {
    this.subs.sink = this.programsService.programs$.subscribe(programs => {

      if (programs.length === 0) {
        this.selectedProgram = undefined;
        return;
      }
      const activeProgram = programs.find(program => program.key === this.passedData.programKey);

      if (activeProgram) {

        const requiredProgram = programs.find(p => p.key === activeProgram.key);

        this.selectedProgram = requiredProgram || programs[0];

        return;
      }

      if (!this.selectedProgram || !programs.includes(this.selectedProgram)) {
        this.selectedProgram = programs[0];
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
