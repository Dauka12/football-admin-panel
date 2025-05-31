type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    dismissible?: boolean;
}

class ToastManager {
    private toasts: Map<string, HTMLElement> = new Map();
    private container: HTMLElement | null = null;

    private createContainer(): HTMLElement {
        if (this.container) return this.container;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(this.container);
        
        return this.container;
    }

    private createToast(
        message: string, 
        type: ToastType, 
        options: ToastOptions = {}
    ): HTMLElement {
        const toast = document.createElement('div');
        const id = Date.now().toString();
        
        const baseClasses = 'flex items-center p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform';
        const typeClasses = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white', 
            warning: 'bg-yellow-600 text-white',
            info: 'bg-blue-600 text-white'
        };

        toast.className = `${baseClasses} ${typeClasses[type]} translate-x-full opacity-0`;
        toast.setAttribute('data-toast-id', id);

        const iconSvg = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">${iconSvg}</div>
                <div class="ml-3 text-sm font-medium">${message}</div>
                ${options.dismissible !== false ? `
                    <button class="ml-4 flex-shrink-0 text-white hover:text-gray-200" onclick="toast.dismiss('${id}')">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;

        return toast;
    }

    private getIcon(type: ToastType): string {
        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>`
        };
        return icons[type];
    }

    show(message: string, type: ToastType, options: ToastOptions = {}): string {
        const container = this.createContainer();
        const toast = this.createToast(message, type, options);
        const id = toast.getAttribute('data-toast-id')!;

        container.appendChild(toast);
        this.toasts.set(id, toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto dismiss
        const duration = options.duration ?? (type === 'error' ? 5000 : 3000);
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }

        return id;
    }

    dismiss(id: string): void {
        const toast = this.toasts.get(id);
        if (!toast) return;

        toast.classList.add('translate-x-full', 'opacity-0');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(id);
        }, 300);
    }

    dismissAll(): void {
        this.toasts.forEach((_, id) => this.dismiss(id));
    }

    success(message: string, options?: ToastOptions): string {
        return this.show(message, 'success', options);
    }

    error(message: string, options?: ToastOptions): string {
        return this.show(message, 'error', options);
    }

    warning(message: string, options?: ToastOptions): string {
        return this.show(message, 'warning', options);
    }

    info(message: string, options?: ToastOptions): string {
        return this.show(message, 'info', options);
    }
}

// Create singleton instance
export const toast = new ToastManager();

// Make it globally available for onclick handlers
(window as any).toast = toast;

// Convenience functions for easier usage
export const showToast = (message: string, type: ToastType = 'info', options?: ToastOptions): string => {
    return toast.show(message, type, options);
};

export const showSuccess = (message: string, options?: ToastOptions): string => {
    return toast.success(message, options);
};

export const showError = (message: string, options?: ToastOptions): string => {
    return toast.error(message, options);
};

export const showWarning = (message: string, options?: ToastOptions): string => {
    return toast.warning(message, options);
};

export const showInfo = (message: string, options?: ToastOptions): string => {
    return toast.info(message, options);
};
