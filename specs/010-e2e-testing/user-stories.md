````markdown
# E2E Testing - User Stories & Test Scenarios

This document serves as the backbone for all E2E test cases. Each user story describes what users can do or want to do in the Kaeri application.

---

## 1. Authentication & Account Management

### US-1.1: User Registration
**As a** new user  
**I want to** create an account with my email and password  
**So that** I can access the application and save my work

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 1.1.1 | Successful signup | I am on the auth page | I fill valid email, username, password and submit | I am redirected to dashboard with session active |
| 1.1.2 | Signup with existing email | I am on the auth page | I submit with an already registered email | I see an error "Email already exists" |
| 1.1.3 | Signup with weak password | I am on the auth page | I submit with password "123" | I see validation error for password strength |
| 1.1.4 | Signup with invalid email | I am on the auth page | I submit with "notanemail" | I see validation error for email format |
| 1.1.5 | Signup with empty fields | I am on the auth page | I submit without filling required fields | I see validation errors for required fields |

---

### US-1.2: User Login
**As a** registered user  
**I want to** log into my account  
**So that** I can access my series and continue writing

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 1.2.1 | Successful login | I am on the auth page | I enter valid credentials and submit | I am redirected to dashboard |
| 1.2.2 | Login with wrong password | I am on the auth page | I enter correct email but wrong password | I see an error message |
| 1.2.3 | Login with non-existent email | I am on the auth page | I enter unregistered email | I see an error message |
| 1.2.4 | Login preserves session | I am logged in | I refresh the page | I remain logged in |
| 1.2.5 | Login redirect from protected route | I try to access /dashboard without auth | The page loads | I am redirected to /auth |

---

### US-1.3: User Logout
**As a** logged-in user  
**I want to** log out of my account  
**So that** I can secure my session on shared devices

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 1.3.1 | Successful logout | I am logged in on dashboard | I click logout from user menu | I am redirected to home/auth and session is cleared |
| 1.3.2 | Cannot access protected routes after logout | I just logged out | I try to navigate to /dashboard | I am redirected to /auth |

---

### US-1.4: User Profile Management
**As a** user  
**I want to** view and edit my profile  
**So that** I can update my information

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 1.4.1 | View profile | I am on the profile page | The page loads | I see my email, username, and avatar |
| 1.4.2 | Update username | I am on the profile page | I change my username and save | The new username persists on refresh |
| 1.4.3 | Update avatar | I am on the profile page | I upload a new avatar image | The new avatar displays across the app |

---

## 2. Series Management

### US-2.1: Create Series
**As a** writer  
**I want to** create a new series  
**So that** I can organize my scripts and knowledge base

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 2.1.1 | Create series with title only | I am on dashboard | I click create, enter title, submit | Series appears in my library |
| 2.1.2 | Create series with all fields | I am on dashboard | I fill title, genre, logline, and submit | Series appears with all metadata |
| 2.1.3 | Create series validation | I am in create modal | I submit without title | I see validation error for required title |
| 2.1.4 | Cancel series creation | I am in create modal | I click cancel or press Escape | Modal closes, no series created |
| 2.1.5 | Create multiple series | I have one series | I create another series | Both series appear in library |

---

### US-2.2: View Series Library
**As a** writer  
**I want to** see all my series in a library view  
**So that** I can quickly find and access my work

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 2.2.1 | View empty library | I have no series | I visit dashboard | I see empty state with create prompt |
| 2.2.2 | View series grid | I have multiple series | I visit dashboard | I see all series as cards in a grid |
| 2.2.3 | Series card shows metadata | I have a series with metadata | I view the library | I see title, genre, last edited date on card |
| 2.2.4 | Search series by title | I have series "Drama One" and "Comedy Two" | I search for "Drama" | Only "Drama One" is visible |
| 2.2.5 | Clear search shows all | I searched and filtered series | I clear the search input | All series are visible again |

---

### US-2.3: Edit Series
**As a** writer  
**I want to** edit my series metadata  
**So that** I can keep information accurate

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 2.3.1 | Edit series title | I am viewing a series | I edit and change the title | New title persists and displays |
| 2.3.2 | Edit series genre | I am viewing a series | I change the genre | New genre persists |
| 2.3.3 | Edit series logline | I am viewing a series | I update the logline | New logline persists |
| 2.3.4 | Cancel edit | I am in edit modal | I cancel the edit | Original values remain |

---

### US-2.4: Delete Series
**As a** writer  
**I want to** delete a series I no longer need  
**So that** I can keep my library clean

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 2.4.1 | Delete series with confirmation | I am viewing a series | I click delete and confirm | Series is removed from library |
| 2.4.2 | Cancel delete | I am in delete confirmation | I click cancel | Series remains in library |
| 2.4.3 | Delete series removes scripts | I have a series with scripts | I delete the series | Series and all scripts are removed |

---

### US-2.5: Navigate Series
**As a** writer  
**I want to** navigate between series sections  
**So that** I can access scripts, knowledge base, and settings

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 2.5.1 | Open series from library | I am on dashboard | I click on a series card | I navigate to series view |
| 2.5.2 | Switch to scripts tab | I am in series view | I click Scripts tab | I see scripts list |
| 2.5.3 | Switch to knowledge base tab | I am in series view | I click Knowledge Base tab | I see KB entity tabs |
| 2.5.4 | Switch to settings tab | I am in series view | I click Settings tab | I see series settings |
| 2.5.5 | Return to dashboard | I am in series view | I click back/home | I return to dashboard |

---

## 3. Script Management

### US-3.1: Create Script
**As a** writer  
**I want to** create a new script within a series  
**So that** I can start writing my screenplay

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 3.1.1 | Create script with title | I am in series scripts tab | I click create, enter title, submit | Script appears in scripts list |
| 3.1.2 | Create script validation | I am in create script modal | I submit without title | I see validation error |
| 3.1.3 | Open newly created script | I just created a script | The script is created | I can click to open it in editor |

---

### US-3.2: View Scripts List
**As a** writer  
**I want to** see all scripts in a series  
**So that** I can choose which one to work on

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 3.2.1 | View empty scripts list | Series has no scripts | I view scripts tab | I see empty state with create prompt |
| 3.2.2 | View scripts as cards | Series has multiple scripts | I view scripts tab | I see all scripts as cards |
| 3.2.3 | Script card shows metadata | Script has title and last edited | I view scripts list | I see title and last edited on card |

---

### US-3.3: Edit Script Metadata
**As a** writer  
**I want to** edit script title and metadata  
**So that** I can keep it organized

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 3.3.1 | Edit script title | I am viewing script | I edit and change title | New title persists |
| 3.3.2 | Cancel script edit | I am in edit modal | I cancel | Original title remains |

---

### US-3.4: Delete Script
**As a** writer  
**I want to** delete a script I no longer need  
**So that** I can keep my series organized

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 3.4.1 | Delete script with confirmation | I am viewing script | I click delete and confirm | Script is removed from list |
| 3.4.2 | Cancel delete | I am in delete confirmation | I cancel | Script remains |

---

## 4. Script Editor

### US-4.1: Open Script Editor
**As a** writer  
**I want to** open a script in the editor  
**So that** I can write and edit content

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.1.1 | Open script in editor | I am in scripts list | I click on a script | Editor opens with script content |
| 4.1.2 | Editor shows split layout | I open a script | Editor loads | I see editor on left, KB panel on right |
| 4.1.3 | Editor loads existing content | Script has saved content | I open it | Previous content is displayed |

---

### US-4.2: Block-Based Editing
**As a** writer  
**I want to** write using screenplay block types  
**So that** my script is properly formatted

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.2.1 | Create scene heading block | I am in editor | I select Scene Heading type | Block has blue border and uppercase styling |
| 4.2.2 | Create action block | I am in editor | I select Action type | Block has standard formatting |
| 4.2.3 | Create character block | I am in editor | I select Character type | Block has amber border and centered uppercase |
| 4.2.4 | Create dialogue block | I am in editor | I select Dialogue type | Block has green border and indented text |
| 4.2.5 | Create parenthetical block | I am in editor | I select Parenthetical type | Block has pink border and italic styling |
| 4.2.6 | Create transition block | I am in editor | I select Transition type | Block has yellow border and right-aligned |
| 4.2.7 | Change block type via dropdown | I have an action block | I click type selector and choose Character | Block changes to character styling |
| 4.2.8 | Type in block | I focus a block | I type content | Content appears in the block |

---

### US-4.3: Keyboard Navigation
**As a** writer  
**I want to** use keyboard shortcuts  
**So that** I can write efficiently without reaching for the mouse

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.3.1 | Press Enter creates new block | I am in a block with content | I press Enter | New block is created below |
| 4.3.2 | Enter after scene heading creates action | I am in scene heading block | I press Enter | New action block is created |
| 4.3.3 | Enter after character creates dialogue | I am in character block | I press Enter | New dialogue block is created |
| 4.3.4 | Enter after dialogue creates character | I am in dialogue block | I press Enter | New character block is created |
| 4.3.5 | Tab cycles block types | I am in a block | I press Tab | Block type changes to next type |
| 4.3.6 | Backspace on empty deletes block | I am in an empty block | I press Backspace | Block is deleted, focus moves up |
| 4.3.7 | Arrow up navigates to previous block | I am in a block | I press Arrow Up at start | Focus moves to previous block |
| 4.3.8 | Arrow down navigates to next block | I am in a block | I press Arrow Down at end | Focus moves to next block |

---

### US-4.4: Save Script Content
**As a** writer  
**I want to** save my script  
**So that** my work is preserved

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.4.1 | Manual save | I have unsaved changes | I click Save button | Content is saved, indicator shows "Saved" |
| 4.4.2 | Autosave triggers | I type in a block | I wait for autosave delay | Content is automatically saved |
| 4.4.3 | Content persists on reload | I saved the script | I reload the page | All content and block types are preserved |
| 4.4.4 | Save indicator shows status | I make changes | I observe the save indicator | It shows "Saving..." then "Saved" |

---

### US-4.5: Add Block
**As a** writer  
**I want to** add new blocks at the end of my script  
**So that** I can continue writing

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.5.1 | Click Add Block button | I am at end of script | I click Add Block | New block is added at the end |
| 4.5.2 | New block gets focus | I add a new block | Block is added | New block is automatically focused |

---

### US-4.6: Autocomplete
**As a** writer  
**I want to** get character/location suggestions  
**So that** I can quickly reference entities from my knowledge base

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 4.6.1 | Trigger autocomplete with @ | I am typing in a block | I type "@" | Autocomplete dropdown appears |
| 4.6.2 | Autocomplete shows KB characters | I have characters in KB | I trigger autocomplete | Character names appear in suggestions |
| 4.6.3 | Select autocomplete with keyboard | Autocomplete is open | I use arrow keys and Enter | Selected entity is inserted |
| 4.6.4 | Filter autocomplete by typing | Autocomplete is open | I continue typing | Suggestions filter to match input |
| 4.6.5 | Close autocomplete with Escape | Autocomplete is open | I press Escape | Dropdown closes |

---

## 5. Knowledge Base

### US-5.1: View Knowledge Base
**As a** writer  
**I want to** view the knowledge base for my series  
**So that** I can manage characters, locations, and other entities

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.1.1 | View KB from series | I am in series view | I click Knowledge Base tab | I see KB with entity tabs |
| 5.1.2 | View KB in script editor | I am in script editor | I look at right panel | I see KB panel with tabs |
| 5.1.3 | Switch between entity types | I am in KB | I click different tabs | I see corresponding entity lists |

---

### US-5.2: Manage Characters
**As a** writer  
**I want to** create and manage character entities  
**So that** I can track character information and appearances

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.2.1 | Create character | I am in characters tab | I click Create, fill name, submit | Character appears in list |
| 5.2.2 | Create character with description | I am creating character | I fill name and description | Both fields are saved |
| 5.2.3 | View character list | Series has characters | I view characters tab | I see all characters as cards |
| 5.2.4 | Open character detail | I see character in list | I click on character card | Character detail page opens |
| 5.2.5 | Edit character | I am in character detail | I edit and save | Changes persist |
| 5.2.6 | Delete character | I am in character detail | I delete and confirm | Character is removed from list |

---

### US-5.3: Manage Locations
**As a** writer  
**I want to** create and manage location entities  
**So that** I can track settings and places in my story

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.3.1 | Create location | I am in locations tab | I click Create, fill name, submit | Location appears in list |
| 5.3.2 | View location list | Series has locations | I view locations tab | I see all locations as cards |
| 5.3.3 | Open location detail | I see location in list | I click on location card | Location detail page opens |
| 5.3.4 | Edit location | I am in location detail | I edit and save | Changes persist |
| 5.3.5 | Delete location | I am in location detail | I delete and confirm | Location is removed |

---

### US-5.4: Manage Props
**As a** writer  
**I want to** track props and items  
**So that** I maintain continuity of objects in my story

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.4.1 | Create prop | I am in props tab | I create a prop | Prop appears in list |
| 5.4.2 | View props list | Series has props | I view props tab | I see all props |
| 5.4.3 | Edit prop | I am in prop detail | I edit and save | Changes persist |
| 5.4.4 | Delete prop | I am in prop detail | I delete and confirm | Prop is removed |

---

### US-5.5: Manage Themes
**As a** writer  
**I want to** track themes and motifs  
**So that** I can maintain thematic consistency

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.5.1 | Create theme | I am in themes tab | I create a theme | Theme appears in list |
| 5.5.2 | View themes list | Series has themes | I view themes tab | I see all themes |
| 5.5.3 | Edit theme | I am in theme detail | I edit and save | Changes persist |
| 5.5.4 | Delete theme | I am in theme detail | I delete and confirm | Theme is removed |

---

### US-5.6: Search Knowledge Base
**As a** writer  
**I want to** search across all entities  
**So that** I can quickly find what I'm looking for

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 5.6.1 | Search by name | I have multiple entities | I type in search input | Results filter to matching names |
| 5.6.2 | Search across entity types | I have characters and locations | I search for a term | Matching entities from all types appear |
| 5.6.3 | Clear search | I have an active search | I clear the input | All entities are shown again |
| 5.6.4 | No results found | I search for non-existent term | I view results | I see "No results" message |

---

## 6. Export

### US-6.1: Export Script to PDF
**As a** writer  
**I want to** export my script as a PDF  
**So that** I can share it with others or print it

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 6.1.1 | Export script | I am viewing a script | I click Export to PDF | PDF file downloads |
| 6.1.2 | PDF contains content | I export a script with content | I open the PDF | All blocks are included with formatting |
| 6.1.3 | PDF preserves formatting | I export script with all block types | I open the PDF | Scene headings, dialogue, etc. are formatted correctly |
| 6.1.4 | Export empty script | Script has no content | I try to export | I see a message or empty PDF |

---

## 7. Navigation & UI

### US-7.1: Global Navigation
**As a** user  
**I want to** navigate throughout the application  
**So that** I can access different features

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 7.1.1 | Navigate to dashboard | I am anywhere in the app | I click Dashboard/Home link | I go to dashboard |
| 7.1.2 | Navigate to profile | I am logged in | I click Profile in user menu | I go to profile page |
| 7.1.3 | Navigate to settings | I am logged in | I click Settings in user menu | I go to settings page |
| 7.1.4 | Browser back button | I navigated from dashboard to series | I click browser back | I return to dashboard |
| 7.1.5 | Browser forward button | I went back to dashboard | I click browser forward | I return to series |

---

### US-7.2: Error Handling
**As a** user  
**I want to** see clear error messages  
**So that** I know what went wrong and how to fix it

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 7.2.1 | Form validation errors | I submit invalid form | Submission fails | I see specific error messages |
| 7.2.2 | Network error toast | Network request fails | Error occurs | I see error toast notification |
| 7.2.3 | 404 page | I navigate to non-existent route | Page loads | I see 404 not found page |
| 7.2.4 | Unauthorized redirect | I access resource I don't own | Page loads | I see 404 or redirect to dashboard |

---

### US-7.3: Loading States
**As a** user  
**I want to** see loading indicators  
**So that** I know the app is working

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 7.3.1 | Page loading skeleton | I navigate to a page | Page is loading | I see skeleton loaders |
| 7.3.2 | Button loading state | I submit a form | Request is processing | Button shows loading state |
| 7.3.3 | Data refresh loading | I refresh data | Request is processing | I see loading indicator |

---

### US-7.4: Toast Notifications
**As a** user  
**I want to** receive feedback via toast notifications  
**So that** I know my actions succeeded or failed

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 7.4.1 | Success toast | I successfully create something | Action completes | I see success toast |
| 7.4.2 | Error toast | An action fails | Error occurs | I see error toast |
| 7.4.3 | Dismiss toast | I see a toast | I click dismiss or wait | Toast disappears |

---

## 8. Edge Cases & Error Recovery

### US-8.1: Session Management
**As a** user  
**I want** the app to handle session issues gracefully  
**So that** I don't lose my work

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 8.1.1 | Session expired during action | My session expires | I try to save | I'm prompted to re-login |
| 8.1.2 | Re-login preserves context | I re-login after expiry | Login succeeds | I return to where I was |

---

### US-8.2: Data Recovery
**As a** writer  
**I want** the app to handle save failures  
**So that** I don't lose my writing

**Scenarios:**
| ID | Scenario | Given | When | Then |
|----|----------|-------|------|------|
| 8.2.1 | Save retry on failure | Save request fails | Error occurs | I can retry saving |
| 8.2.2 | Unsaved changes warning | I have unsaved changes | I try to navigate away | I see a warning prompt |

---

## Test Coverage Matrix

| Feature Area | User Stories | Total Scenarios | Priority |
|--------------|--------------|-----------------|----------|
| Authentication | 4 | 15 | P1 |
| Series Management | 5 | 24 | P1 |
| Script Management | 4 | 10 | P1 |
| Script Editor | 6 | 28 | P1 |
| Knowledge Base | 6 | 22 | P1 |
| Export | 1 | 4 | P2 |
| Navigation & UI | 4 | 14 | P2 |
| Edge Cases | 2 | 4 | P3 |
| **Total** | **32** | **121** | - |

---

## Test Execution Priority

### P1 - Critical Path (Must Pass for Release)
- US-1.1, US-1.2, US-1.3 (Auth)
- US-2.1, US-2.2, US-2.5 (Series basics)
- US-3.1, US-4.1, US-4.2, US-4.4 (Script editing)
- US-5.1, US-5.2 (KB basics)

### P2 - Important (Should Pass)
- US-2.3, US-2.4 (Series CRUD complete)
- US-3.2, US-3.3, US-3.4 (Script CRUD complete)
- US-4.3, US-4.5, US-4.6 (Editor advanced)
- US-5.3, US-5.4, US-5.5, US-5.6 (KB complete)
- US-6.1 (Export)

### P3 - Nice to Have
- US-7.x (Navigation & UI polish)
- US-8.x (Edge cases)

````
