export interface IPopupBanner {
    _id: string;
    title: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    linkUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
