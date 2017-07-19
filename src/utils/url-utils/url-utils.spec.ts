import { titleToAnchor } from './url-utils';

describe('url-utils', () => {
    describe('titleToAnchor', () => {
        it('should lowercase titles', () => {
            // Arrange
            const title = 'Title'
            // Act
            const anchor = titleToAnchor(title);
            // Assert
            expect(anchor).toEqual('title');
        });

        it('should replace a space with a dash', () => {
            // Arrange
            const title = 'Title Text'
            // Act
            const anchor = titleToAnchor(title);
            // Assert
            expect(anchor).toEqual('title-text');
        });

        it('should replace consecutive spaces with consecutive dashes', () => {
            // Arrange
            const title = 'Title  Text'
            // Act
            const anchor = titleToAnchor(title);
            // Assert
            expect(anchor).toEqual('title--text');
        });

        it('should ignore non alpha numeric characters', () => {
            // Arrange
            const title = 'Title.Text!'
            // Act
            const anchor = titleToAnchor(title);
            // Assert
            expect(anchor).toEqual('titletext');
        });
    });
});