
interface User {

  id: string;

  name: string;

  email: string;

  department: string;

  role: string;

  adGroups?: string[];

}

 

interface LoginResponse {

  success: boolean;

  user: User;

  token: string;

  expiresIn?: number;

}

 

interface BusinessGroup {

  id: string;

  name: string;

  description: string;

  icon: string;

  color: string;

}

 

interface GroupSelectionResponse {

  success: boolean;

  selectedGroup: string;

  user: User;

}

 

class AuthService {

  private currentUser: User | null = null;

  private isAuthenticated: boolean = false;

 

  private mockUser: User = {

    id: 'AM63351',

    name: 'Clarity AI User',

    email: 'user@EH.com',

    department: 'Healthcare Operations',

    role: 'Business User'

  };

 

  async ssoLogin(): Promise<LoginResponse> {

    return new Promise((resolve) => {

      setTimeout(() => {

        const user = this.mockUser;

        this.currentUser = user;

        this.isAuthenticated = true;

 

        localStorage.setItem('clarity_user', JSON.stringify(user));

        localStorage.setItem('clarity_authenticated', 'true');

 

        resolve({

          success: true,

          user: user,

          token: `mock_token_${Date.now()}`,

          expiresIn: 3600

        });

      }, 1500);

    });

  }

 

  isUserAuthenticated(): boolean {

    if (this.isAuthenticated) return true;

 

    const stored = localStorage.getItem('clarity_authenticated');

    const user = localStorage.getItem('clarity_user');

 

    if (stored === 'true' && user) {

      this.isAuthenticated = true;

      this.currentUser = JSON.parse(user);

      return true;

    }

 

    return false;

  }

 

  getCurrentUser(): User | null {

    if (this.currentUser) return this.currentUser;

 

    const stored = localStorage.getItem('clarity_user');

    if (stored) {

      this.currentUser = JSON.parse(stored);

      return this.currentUser;

    }

 

    return null;

  }

 

  hasMultipleGroups(): boolean {

    return true;

  }

 

  isDeveloper(): boolean {

    const user = this.getCurrentUser();

    if (!user || !user.adGroups) {

      const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost' ||

        window.location.hostname === '127.0.0.1';

      const devFlag = localStorage.getItem('clarity_dev_mode') === 'true';

      const isDevUser = user && (

        user.role === 'Developer' ||

        user.role === 'Senior Developer' ||

        user.department === 'IT' ||

        user.id === 'AM63351'

      );

 

      return isDevelopment || isDevUser || devFlag;

    }

 

    const devADGroups = [

      'Clarity_AI_Developers',

      'Clarity_AI_Dev_Team',

      'IT_Development',

      'Software_Developers',

      'Clarity_Developers'

    ];

 

    return user.adGroups.some(group =>

      devADGroups.includes(group) ||

      group.toLowerCase().includes('dev') ||

      group.toLowerCase().includes('developer')

    );

  }

 

  getAvailableGroups(): BusinessGroup[] {

    const oktaUserInfo = sessionStorage.getItem('okta_user_info');

    let userGroups: string[] = [];

   

    if (oktaUserInfo) {

      try {

        const ssoUser = JSON.parse(oktaUserInfo);

        userGroups = ssoUser.groups || [];

      } catch (error) {

        console.error('Error parsing SSO user info:', error);

      }

    }

 

    if (userGroups.length === 0) {

      return [];

    }

 

    const businessGroups: BusinessGroup[] = userGroups.map((groupId, index) => {

      const friendlyName = this.formatGroupName(groupId);

      const icon = this.getIconForGroup(groupId);

      const color = this.getColorForGroup(index);

     

      return {

        id: groupId,

        name: friendlyName,

        description: `Access to ${friendlyName} features and data`,

        icon: icon,

        color: color

      };

    });

 

    return businessGroups;

  }

 

  private formatGroupName(groupId: string): string {

    let name = groupId.replace(/^clarity_ai_/i, '');

    name = name.replace(/_/g, ' ');

   

    name = name.split(' ').map(word => {

      if (word.toUpperCase() === word && word.length > 1) {

        return word.toUpperCase();

      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    }).join(' ');

   

    return name;

  }

 

  private getIconForGroup(groupId: string): string {

    const lowerGroupId = groupId.toLowerCase();

   

    if (lowerGroupId.includes('dev')) {

      return 'cog';

    } else if (lowerGroupId.includes('dental')) {

      return 'microphone';

    } else if (lowerGroupId.includes('compliance') || lowerGroupId.includes('broker')) {

      return 'shield-alt';

    } else if (lowerGroupId.includes('audit') || lowerGroupId.includes('quality')) {

      return 'chart-line';

    } else if (lowerGroupId.includes('clinical')) {

      return 'chart-line';

    } else {

      return 'server';

    }

  }

 

  private getColorForGroup(index: number): string {

    const colors = ['#4299e1', '#38a169', '#d69e2e', '#805ad5', '#e53e3e', '#dd6b20'];

    return colors[index % colors.length];

  }

 

  selectGroup(groupId: string): GroupSelectionResponse {

    const user = this.getCurrentUser();

    if (!user) {

      throw new Error('User not authenticated');

    }

 

    const availableGroups = this.getAvailableGroups();

    const selectedGroup = availableGroups.find(group => group.id === groupId);

    if (!selectedGroup) {

      throw new Error('Invalid group selection');

    }

 

    localStorage.setItem('clarity_selected_group', groupId);

 

    return {

      success: true,

      selectedGroup: groupId,

      user: user

    };

  }

 

  getSelectedGroup(): string | null {

    return localStorage.getItem('clarity_selected_group');

  }

 

  logout(): { success: boolean } {

    this.currentUser = null;

    this.isAuthenticated = false;

    localStorage.removeItem('clarity_user');

    localStorage.removeItem('clarity_authenticated');

    localStorage.removeItem('clarity_selected_group');

 

    return { success: true };

  }

 

  async loginAs(): Promise<LoginResponse> {

    return this.ssoLogin();

  }

}

 

const authService = new AuthService();

export default authService;

 

 

 

 